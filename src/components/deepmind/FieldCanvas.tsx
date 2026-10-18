import { useEffect, useRef } from "react"
import {
  buildFieldEdges,
  generateFieldPositions,
  pickAccentIndices,
  scrollFade,
} from "#/lib/field-geometry"
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "#/lib/gsap"
import { cn } from "#/lib/utils"

type FieldCanvasProps = {
  seed: string
  pointCount?: number
  className?: string
  scrollLinked?: boolean
}

function readToken(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function FieldCanvas({ seed, pointCount = 360, className, scrollLinked = true }: FieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let disposed = false
    let teardown: () => void = () => undefined

    const start = async (): Promise<void> => {
      const canvas = canvasRef.current
      const host = canvas?.parentElement
      if (!canvas || !host) return
      const THREE = await import("three")
      if (disposed) return

      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" })
      } catch {
        return
      }

      registerGsap()
      const reduced = prefersReducedMotion()
      const inkSoft = new THREE.Color(readToken("--lab-ink-soft", "#8fa3bd"))
      const orange = new THREE.Color(readToken("--lab-orange", "#f65a0b"))

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20)
      camera.position.z = 3.6
      const group = new THREE.Group()
      scene.add(group)

      const positions = generateFieldPositions(pointCount, seed, 1.25)
      const edges = buildFieldEdges(positions, 0.42, 900)
      const accentIndices = pickAccentIndices(pointCount, Math.max(4, Math.round(pointCount / 45)), seed)

      const spriteCanvas = document.createElement("canvas")
      spriteCanvas.width = 64
      spriteCanvas.height = 64
      const spriteContext = spriteCanvas.getContext("2d")
      if (spriteContext) {
        const gradient = spriteContext.createRadialGradient(32, 32, 0, 32, 32, 32)
        gradient.addColorStop(0, "rgba(255,255,255,1)")
        gradient.addColorStop(0.45, "rgba(255,255,255,0.9)")
        gradient.addColorStop(1, "rgba(255,255,255,0)")
        spriteContext.fillStyle = gradient
        spriteContext.fillRect(0, 0, 64, 64)
      }
      const sprite = new THREE.CanvasTexture(spriteCanvas)

      const pointGeometry = new THREE.BufferGeometry()
      pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      const pointMaterial = new THREE.PointsMaterial({
        color: inkSoft,
        size: 0.034,
        map: sprite,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        sizeAttenuation: true,
      })
      group.add(new THREE.Points(pointGeometry, pointMaterial))

      const lineGeometry = new THREE.BufferGeometry()
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      lineGeometry.setIndex(new THREE.BufferAttribute(edges, 1))
      const lineMaterial = new THREE.LineBasicMaterial({ color: inkSoft, transparent: true, opacity: 0 })
      group.add(new THREE.LineSegments(lineGeometry, lineMaterial))

      const accentPositions = new Float32Array(accentIndices.length * 3)
      accentIndices.forEach((pointIndex, slot) => {
        accentPositions[slot * 3] = positions[pointIndex * 3]
        accentPositions[slot * 3 + 1] = positions[pointIndex * 3 + 1]
        accentPositions[slot * 3 + 2] = positions[pointIndex * 3 + 2]
      })
      const accentGeometry = new THREE.BufferGeometry()
      accentGeometry.setAttribute("position", new THREE.BufferAttribute(accentPositions, 3))
      const accentMaterial = new THREE.PointsMaterial({
        color: orange,
        size: 0.075,
        map: sprite,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        sizeAttenuation: true,
      })
      group.add(new THREE.Points(accentGeometry, accentMaterial))

      const state = { intro: reduced ? 1 : 0, scroll: 0, tiltX: 0, tiltY: 0, visible: true, spin: 0 }
      const setTiltX = gsap.quickTo(state, "tiltX", { duration: 1.2, ease: "power3.out" })
      const setTiltY = gsap.quickTo(state, "tiltY", { duration: 1.2, ease: "power3.out" })

      const resize = (): void => {
        const width = Math.max(1, host.clientWidth)
        const height = Math.max(1, host.clientHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }

      const render = (): void => {
        if (!state.visible && !reduced) return
        const fade = scrollFade(state.scroll)
        const reveal = state.intro * fade
        group.rotation.y = state.spin + state.tiltY * 0.35
        group.rotation.x = 0.18 + state.tiltX * 0.22 + state.scroll * 0.5
        const scale = (0.78 + state.intro * 0.22) * (1 - state.scroll * 0.25)
        group.scale.setScalar(scale)
        pointMaterial.opacity = 0.75 * reveal
        lineMaterial.opacity = 0.12 * reveal
        accentMaterial.opacity = reveal
        renderer.render(scene, camera)
      }

      const tick = (_time: number, deltaMs: number): void => {
        state.spin += (deltaMs / 1000) * 0.07
        render()
      }

      const onPointerMove = (event: PointerEvent): void => {
        const bounds = host.getBoundingClientRect()
        setTiltY(((event.clientX - bounds.left) / bounds.width - 0.5) * 2)
        setTiltX(((event.clientY - bounds.top) / bounds.height - 0.5) * 2)
      }

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      resize()

      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          state.visible = entries[0]?.isIntersecting ?? true
        },
        { threshold: 0 },
      )
      visibilityObserver.observe(host)

      let introTween: gsap.core.Tween | null = null
      let pulseTween: gsap.core.Tween | null = null
      let trigger: ScrollTrigger | null = null

      if (reduced) {
        render()
      } else {
        introTween = gsap.to(state, { intro: 1, duration: 2.2, ease: "power3.out" })
        pulseTween = gsap.to(accentMaterial, { size: 0.12, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 })
        gsap.ticker.add(tick)
        window.addEventListener("pointermove", onPointerMove, { passive: true })
        if (scrollLinked) {
          trigger = ScrollTrigger.create({
            trigger: host,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              state.scroll = self.progress
            },
          })
        }
      }

      teardown = () => {
        gsap.ticker.remove(tick)
        window.removeEventListener("pointermove", onPointerMove)
        resizeObserver.disconnect()
        visibilityObserver.disconnect()
        introTween?.kill()
        pulseTween?.kill()
        trigger?.kill()
        gsap.killTweensOf(state)
        pointGeometry.dispose()
        lineGeometry.dispose()
        accentGeometry.dispose()
        pointMaterial.dispose()
        lineMaterial.dispose()
        accentMaterial.dispose()
        sprite.dispose()
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }

    void start()

    return () => {
      disposed = true
      teardown()
    }
  }, [seed, pointCount, scrollLinked])

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />
}
