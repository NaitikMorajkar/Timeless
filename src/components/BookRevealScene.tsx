import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const GOLD = 0xd9a85f
const DEEP_NAVY = 0x08111f
const PAPER = 0xd9c9aa

type MemoryObject = {
  rig: THREE.Group
  visual: THREE.Object3D
  end: THREE.Vector3
  endRotation: THREE.Euler
  trail: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>
  floatPhase: number
}

function makeMemoryTexture(kind: 'note' | 'photo' | 'fragment') {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 220
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)

  context.fillStyle = kind === 'photo' ? '#56616b' : kind === 'fragment' ? '#a98756' : '#dfceb1'
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (kind === 'photo') {
    const sky = context.createLinearGradient(0, 0, 0, canvas.height)
    sky.addColorStop(0, '#83909a')
    sky.addColorStop(0.52, '#b4ab98')
    sky.addColorStop(0.53, '#53604f')
    sky.addColorStop(1, '#2f3e36')
    context.fillStyle = sky
    context.fillRect(10, 10, canvas.width - 20, canvas.height - 20)
    context.fillStyle = 'rgba(231, 220, 184, .78)'
    context.beginPath()
    context.arc(218, 63, 29, 0, Math.PI * 2)
    context.fill()
    context.fillStyle = '#3f4c40'
    context.beginPath()
    context.moveTo(18, 172)
    context.quadraticCurveTo(100, 82, 173, 160)
    context.quadraticCurveTo(238, 91, 303, 178)
    context.lineTo(303, 210)
    context.lineTo(18, 210)
    context.closePath()
    context.fill()
  } else {
    context.strokeStyle = kind === 'fragment' ? 'rgba(36, 36, 27, .55)' : 'rgba(72, 58, 39, .46)'
    context.lineWidth = 3
    for (let y = 48; y < 180; y += 31) {
      context.beginPath()
      context.moveTo(34, y)
      context.quadraticCurveTo(120, y - 7, 267, y + 1)
      context.stroke()
    }
    if (kind === 'note') {
      context.strokeStyle = 'rgba(185, 87, 67, .68)'
      context.beginPath()
      context.arc(80, 62, 19, 0, Math.PI * 2)
      context.stroke()
      context.beginPath()
      context.moveTo(94, 77)
      context.lineTo(128, 108)
      context.stroke()
    } else {
      context.fillStyle = 'rgba(54, 46, 31, .68)'
      context.beginPath()
      context.moveTo(44, 30)
      context.lineTo(93, 30)
      context.lineTo(75, 63)
      context.closePath()
      context.fill()
      context.beginPath()
      context.moveTo(238, 142)
      context.lineTo(279, 142)
      context.lineTo(269, 181)
      context.closePath()
      context.fill()
    }
  }

  context.strokeStyle = 'rgba(255, 234, 182, .48)'
  context.lineWidth = 4
  context.strokeRect(11, 11, canvas.width - 22, canvas.height - 22)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createDust() {
  const positions = new Float32Array(190 * 3)
  for (let index = 0; index < positions.length; index += 3) {
    positions[index] = (Math.random() - 0.5) * 7.5
    positions[index + 1] = Math.random() * 4.8 - 2.1
    positions[index + 2] = (Math.random() - 0.5) * 3.8
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ color: 0xecc27a, size: 0.028, transparent: true, opacity: 0.62, sizeAttenuation: true })
  return new THREE.Points(geometry, material)
}

function createShelves() {
  const group = new THREE.Group()
  const wood = new THREE.MeshStandardMaterial({ color: 0x172536, roughness: 0.86, metalness: 0.05 })
  const shadowWood = new THREE.MeshStandardMaterial({ color: 0x0d1724, roughness: 0.94, metalness: 0.02 })

  for (let index = -4; index <= 4; index += 1) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.64, 3.5, 0.25), wood)
    shelf.position.set(index * 0.86, 0.62, -1.4 - Math.abs(index) * 0.04)
    group.add(shelf)
    for (let row = 0; row < 3; row += 1) {
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.36 + Math.random() * 0.18, 0.14 + Math.random() * 0.15, 0.23), shadowWood)
      book.position.set(index * 0.86 + (Math.random() - 0.5) * 0.08, -0.58 + row * 0.72, -1.22)
      book.rotation.z = (Math.random() - 0.5) * 0.16
      group.add(book)
    }
  }

  const topRail = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.15, 0.28), wood)
  topRail.position.set(0, 2.33, -1.4)
  group.add(topRail)
  return group
}

function createArtifact() {
  const artifact = new THREE.Group()
  const clay = new THREE.MeshStandardMaterial({ color: 0x806047, roughness: 0.72, metalness: 0.08 })
  const gold = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.36, metalness: 0.72 })
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.34, 16), clay)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 24), gold)
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.18
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.018, 8, 24), gold)
  band.rotation.x = Math.PI / 2
  band.position.y = -0.02
  artifact.add(vessel, rim, band)
  return artifact
}

function createMemoryTrail(end: THREE.Vector3, index: number) {
  const start = new THREE.Vector3(0, 0.42, 0)
  const bend = new THREE.Vector3(end.x * 0.36, end.y * 0.72 + 0.15, end.z * 0.45 + (index - 2) * 0.08)
  const curve = new THREE.CatmullRomCurve3([start, bend, end])
  const geometry = new THREE.TubeGeometry(curve, 24, 0.012, 5, false)
  const material = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  return new THREE.Mesh(geometry, material)
}

function globePoint(latitude: number, longitude: number, radius = 1.72) {
  const phi = (90 - latitude) * (Math.PI / 180)
  const theta = (longitude + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

function createKnowledgeGlobe() {
  const group = new THREE.Group()
  group.position.set(0.45, 0.2, -0.65)
  group.scale.setScalar(0.02)

  const material = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  const pointMaterial = new THREE.PointsMaterial({ color: 0xf4c977, size: 0.038, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, sizeAttenuation: true })
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffd88a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })

  const lineGroup = new THREE.Group()
  for (let latitude = -60; latitude <= 60; latitude += 30) {
    const points: THREE.Vector3[] = []
    for (let longitude = -180; longitude <= 180; longitude += 12) points.push(globePoint(latitude, longitude))
    lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
  for (let longitude = -180; longitude < 180; longitude += 30) {
    const points: THREE.Vector3[] = []
    for (let latitude = -90; latitude <= 90; latitude += 10) points.push(globePoint(latitude, longitude))
    lineGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material))
  }
  group.add(lineGroup)

  const nodePositions = [
    [-36, -118], [35, -98], [51, -2], [20, 77], [-25, 134], [-34, 18], [4, 32], [60, 120],
  ].map(([latitude, longitude]) => globePoint(latitude, longitude))
  const pointGeometry = new THREE.BufferGeometry().setFromPoints(nodePositions)
  group.add(new THREE.Points(pointGeometry, pointMaterial))
  nodePositions.forEach((position) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), nodeMaterial)
    node.position.copy(position)
    group.add(node)
  })

  const connectionPairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [2, 6], [6, 3], [1, 6], [4, 7], [7, 2]]
  connectionPairs.forEach(([from, to], index) => {
    const start = nodePositions[from]
    const end = nodePositions[to]
    const midpoint = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(2.08 + (index % 2) * 0.08)
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end)
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(18)), material))
  })

  return { group, material, pointMaterial, nodeMaterial, nodePositions }
}

function createFinalRays() {
  const group = new THREE.Group()
  const material = new THREE.LineBasicMaterial({ color: 0xe8b96c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  const rayEnds = [
    new THREE.Vector3(-3.8, 2.8, -0.3), new THREE.Vector3(-2.6, -2.5, 0.2),
    new THREE.Vector3(3.7, 2.6, -0.4), new THREE.Vector3(3.1, -2.4, -0.2),
    new THREE.Vector3(0.1, 3.4, -0.8), new THREE.Vector3(-0.2, -3.2, -0.7),
  ]
  rayEnds.forEach((end, index) => {
    const start = end.clone().multiplyScalar(0.22).add(new THREE.Vector3(0.45, 0.2, -0.65))
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
    const ray = new THREE.Line(geometry, material)
    ray.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.018
    group.add(ray)
  })
  return { group, material }
}

function createFinalParticles() {
  const positions = new Float32Array(120 * 3)
  for (let index = 0; index < positions.length; index += 3) {
    const angle = Math.random() * Math.PI * 2
    const radius = 2.2 + Math.random() * 2.6
    positions[index] = Math.cos(angle) * radius
    positions[index + 1] = (Math.random() - 0.5) * 4.8
    positions[index + 2] = Math.sin(angle) * radius - 0.8
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ color: 0xecc27a, size: 0.024, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, sizeAttenuation: true })
  return { points: new THREE.Points(geometry, material), material }
}

export function BookRevealScene() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    gsap.registerPlugin(ScrollTrigger)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      section.dataset.webglFallback = 'true'
      return
    }

    delete section.dataset.webglFallback

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100)
    camera.position.set(0.35, 2.28, 6.35)
    camera.lookAt(0, 0.15, 0)
    const cameraTarget = new THREE.Vector3(0, 0.15, 0)
    scene.fog = new THREE.Fog(DEEP_NAVY, 5, 10)

    const ambient = new THREE.AmbientLight(0x8fa1b9, 0.6)
    const keyLight = new THREE.DirectionalLight(0xcbd6dd, 1.2)
    keyLight.position.set(-3, 5, 4)
    const bookLight = new THREE.PointLight(GOLD, 0, 5.2, 1.7)
    bookLight.position.set(0, 0.6, 0.3)
    scene.add(ambient, keyLight, bookLight)

    const archiveGroup = new THREE.Group()
    scene.add(archiveGroup)
    const stage = new THREE.Group()
    stage.rotation.x = -0.12
    stage.position.y = -0.45
    archiveGroup.add(stage)
    archiveGroup.add(createShelves())

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.18, 4.5),
      new THREE.MeshStandardMaterial({ color: 0x111c29, roughness: 0.9, metalness: 0.05 }),
    )
    table.position.set(0, -1.28, 0.1)
    archiveGroup.add(table)

    const book = new THREE.Group()
    book.position.y = 0.05
    stage.add(book)

    const pageMaterial = new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.78, metalness: 0.02, side: THREE.DoubleSide })
    const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(3.32, 0.32, 2.28), pageMaterial)
    pageBlock.position.y = 0.12
    book.add(pageBlock)

    const coverMaterial = new THREE.MeshStandardMaterial({ color: 0x39281f, roughness: 0.68, metalness: 0.18, side: THREE.DoubleSide })
    const goldEdgeMaterial = new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.42, metalness: 0.64 })
    const leftCover = new THREE.Group()
    const rightCover = new THREE.Group()
    const leftMesh = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 2.55), coverMaterial)
    const rightMesh = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.14, 2.55), coverMaterial)
    leftMesh.position.x = -0.92
    rightMesh.position.x = 0.92
    leftCover.add(leftMesh)
    rightCover.add(rightMesh)
    book.add(leftCover, rightCover)

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 2.58), goldEdgeMaterial)
    spine.position.y = 0.11
    book.add(spine)

    const pageSheets: THREE.Group[] = []
    for (let index = 0; index < 7; index += 1) {
      const pagePivot = new THREE.Group()
      const page = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.025, 2.12), pageMaterial)
      page.position.set(0.76, 0.3 + index * 0.008, 0)
      pagePivot.add(page)
      book.add(pagePivot)
      pageSheets.push(pagePivot)
    }

    const memoryPlans = [
      { kind: 'note' as const, end: new THREE.Vector3(-1.95, 1.58, 0.18), rotation: new THREE.Euler(0.1, -0.25, 0.16) },
      { kind: 'photo' as const, end: new THREE.Vector3(1.75, 1.62, -0.42), rotation: new THREE.Euler(-0.1, 0.38, -0.2) },
      { kind: 'fragment' as const, end: new THREE.Vector3(2.12, 0.86, -1.05), rotation: new THREE.Euler(0.2, -0.5, 0.24) },
      { kind: 'artifact' as const, end: new THREE.Vector3(-1.12, 1.06, -1.18), rotation: new THREE.Euler(0.1, 0.5, -0.2) },
      { kind: 'note' as const, end: new THREE.Vector3(0.72, 2.18, -0.62), rotation: new THREE.Euler(-0.18, -0.34, 0.3) },
    ]
    const memoryObjects: MemoryObject[] = memoryPlans.map((plan, index) => {
      const rig = new THREE.Group()
      const visual = plan.kind === 'artifact'
        ? createArtifact()
        : new THREE.Mesh(
            new THREE.PlaneGeometry(plan.kind === 'photo' ? 0.98 : 0.82, plan.kind === 'photo' ? 0.68 : 0.58),
            new THREE.MeshStandardMaterial({ map: makeMemoryTexture(plan.kind), transparent: true, side: THREE.DoubleSide, roughness: 0.84 }),
          )
      visual.position.set(0, 0, 0)
      rig.position.set(0, 0.42, 0)
      rig.scale.setScalar(0.02)
      rig.add(visual)
      stage.add(rig)
      const trail = createMemoryTrail(plan.end, index)
      stage.add(trail)
      return { rig, visual, end: plan.end, endRotation: plan.rotation, trail, floatPhase: index * 1.3 }
    })

    const globe = createKnowledgeGlobe()
    scene.add(globe.group)
    const connectionMaterial = new THREE.LineBasicMaterial({ color: 0xf0bf6d, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    const memoryConnections = new THREE.Group()
    memoryObjects.forEach((object, index) => {
      const start = object.end.clone().add(new THREE.Vector3(0, 0, 0.1))
      const end = globe.nodePositions[index % globe.nodePositions.length].clone().add(globe.group.position)
      const bend = start.clone().lerp(end, 0.52)
      bend.y += 0.36 + index * 0.04
      const curve = new THREE.CatmullRomCurve3([start, bend, end])
      memoryConnections.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(22)), connectionMaterial))
    })
    scene.add(memoryConnections)
    const globeLight = new THREE.PointLight(GOLD, 0, 6.5, 1.45)
    globeLight.position.set(0.35, 0.35, 1.2)
    scene.add(globeLight)
    const finalRays = createFinalRays()
    const finalParticles = createFinalParticles()
    scene.add(finalRays.group, finalParticles.points)

    const dust = createDust()
    scene.add(dust)

    const resize = () => {
      const bounds = section.getBoundingClientRect()
      const width = Math.max(320, bounds.width)
      const height = Math.max(1, bounds.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const render = () => {
      const time = performance.now()
      dust.rotation.y += prefersReducedMotion ? 0 : 0.0007
      dust.position.y = prefersReducedMotion ? 0 : Math.sin(time * 0.00025) * 0.05
      memoryObjects.forEach((object) => {
        const drift = prefersReducedMotion ? 0 : Math.sin(time * 0.0007 + object.floatPhase) * 0.045
        object.visual.position.y = drift
        object.visual.rotation.z = prefersReducedMotion ? 0 : Math.sin(time * 0.00045 + object.floatPhase) * 0.035
      })
      finalRays.group.rotation.z += prefersReducedMotion ? 0 : 0.00012
      finalParticles.points.rotation.y += prefersReducedMotion ? 0 : 0.00022
      camera.lookAt(cameraTarget)
      renderer.render(scene, camera)
    }
    gsap.ticker.add(render)

    // Capture both the timeline and pin so remounts restore their initial styles.
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true })
      const globeTitle = section.querySelector<HTMLElement>('.book-reveal__globe-title')
      timeline
        .to(leftCover.rotation, { y: -1.16, duration: 1, ease: 'power2.inOut' }, 0)
        .to(rightCover.rotation, { y: 1.16, duration: 1, ease: 'power2.inOut' }, 0)
        .to(stage.rotation, { x: -0.34, y: -0.08, duration: 1, ease: 'power2.inOut' }, 0)
        .to(camera.position, { x: -0.18, y: 1.28, z: 4.65, duration: 1.15, ease: 'power2.inOut' }, 0)
        .to(cameraTarget, { x: 0.2, y: 0.68, z: -0.48, duration: 1.1, ease: 'power2.inOut' }, 0)
        .to(bookLight, { intensity: 3.4, duration: 0.58, ease: 'power2.out' }, 0.26)
        .to(keyLight, { intensity: 1.75, duration: 0.7, ease: 'power2.out' }, 0.25)
        .to(pageSheets.map((page) => page.rotation), { y: -0.65, duration: 0.38, stagger: 0.075, ease: 'power2.inOut' }, 0.36)
        .to(pageSheets.map((page) => page.rotation), { y: 0.12, duration: 0.46, stagger: 0.08, ease: 'power2.inOut' }, 0.66)

      memoryObjects.forEach((object, index) => {
        const startAt = 0.48 + index * 0.1
        timeline.to(object.rig.position, { x: object.end.x, y: object.end.y, z: object.end.z, duration: 0.48, ease: 'power2.out' }, startAt)
        timeline.to(object.rig.rotation, { x: object.endRotation.x, y: object.endRotation.y, z: object.endRotation.z, duration: 0.5, ease: 'power2.out' }, startAt)
        timeline.to(object.rig.scale, { x: 1, y: 1, z: 1, duration: 0.44, ease: 'back.out(1.4)' }, startAt)
        timeline.to(object.trail.material, { opacity: index === 3 ? 0.68 : 0.48, duration: 0.42, ease: 'power2.out' }, startAt - 0.06)
      })

      timeline
        .to(archiveGroup.position, { z: -2.6, y: -1.05, duration: 0.95, ease: 'power2.inOut' }, 1.02)
        .to(archiveGroup.scale, { x: 0.56, y: 0.56, z: 0.56, duration: 0.95, ease: 'power2.inOut' }, 1.02)
        .to(camera.position, { x: 0.12, y: 0.4, z: 5.15, duration: 1.08, ease: 'power2.inOut' }, 1.02)
        .to(cameraTarget, { x: 0.35, y: 0.25, z: -0.72, duration: 1.08, ease: 'power2.inOut' }, 1.02)
        .to(ambient, { intensity: 0.22, duration: 0.85, ease: 'power2.out' }, 1.02)
        .to(keyLight, { intensity: 0.28, duration: 0.85, ease: 'power2.out' }, 1.02)
        .to(bookLight, { intensity: 0.55, duration: 0.7, ease: 'power2.inOut' }, 1.02)
        .to(globe.group.rotation, { y: Math.PI * 1.5, x: 0.16, duration: 2.32, ease: 'none' }, 1.16)
        .to(globe.group.scale, { x: 1, y: 1, z: 1, duration: 1.05, ease: 'power3.out' }, 1.16)
        .to(globe.material, { opacity: 0.38, duration: 0.82, ease: 'power2.out' }, 1.26)
        .to(connectionMaterial, { opacity: 0.45, duration: 0.7, ease: 'power2.out' }, 1.2)
        .to(globe.pointMaterial, { opacity: 0.9, duration: 0.72, ease: 'power2.out' }, 1.32)
        .to(globe.nodeMaterial, { opacity: 0.96, duration: 0.68, ease: 'power2.out' }, 1.38)
        .to(globeLight, { intensity: 2.4, duration: 0.9, ease: 'power2.out' }, 1.2)
      if (globeTitle) timeline.to(globeTitle, { opacity: 1, y: 0, duration: 0.72, ease: 'power2.out' }, 1.6)

      const finalTitle = section.querySelector<HTMLElement>('.book-reveal__final-title')
      timeline
        .to(camera.position, { x: 0.28, y: 0.24, z: 3.45, duration: 0.72, ease: 'power2.inOut' }, 1.95)
        .to(cameraTarget, { x: 0.45, y: 0.2, z: -0.72, duration: 0.72, ease: 'power2.inOut' }, 1.95)
        .to(globe.material, { opacity: 0.6, duration: 0.48, ease: 'power2.out' }, 2.02)
        .to(globe.pointMaterial, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.02)
        .to(globe.nodeMaterial, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 2.02)
        .to(globeLight, { intensity: 3.8, duration: 0.44, ease: 'power2.out' }, 2.02)
        .to(camera.position, { x: 0.1, y: 0.55, z: 6.25, duration: 1.0, ease: 'power2.inOut' }, 2.48)
        .to(cameraTarget, { x: 0.18, y: 0.14, z: -0.7, duration: 1.0, ease: 'power2.inOut' }, 2.48)
        .to(globeLight, { intensity: 2.15, duration: 0.82, ease: 'power2.inOut' }, 2.48)
        .to(finalRays.material, { opacity: 0.18, duration: 0.62, ease: 'power2.out' }, 2.42)
        .to(finalParticles.material, { opacity: 0.46, duration: 0.72, ease: 'power2.out' }, 2.42)
      if (globeTitle) timeline.to(globeTitle, { opacity: 0, y: -12, duration: 0.46, ease: 'power2.in' }, 2.5)
      if (finalTitle) timeline.to(finalTitle, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 2.72)

      if (prefersReducedMotion) {
        timeline.progress(1)
      } else {
        ScrollTrigger.create({
          animation: timeline,
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerWidth <= 680 ? 1800 : 2400}`,
          pin: true,
          scrub: window.innerWidth <= 680 ? 1.1 : 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
      }
    }, section)

    let disposed = false
    void document.fonts.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh()
    })

    return () => {
      disposed = true
      context.revert()
      gsap.ticker.remove(render)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
          else object.material.dispose()
        }
      })
    }
  }, [])

  return (
    <section id="memories" ref={sectionRef} className="book-reveal-section" aria-labelledby="book-reveal-title">
      <canvas ref={canvasRef} className="book-reveal-canvas" aria-hidden="true" />
      <div className="book-reveal__vignette" aria-hidden="true" />
      <div className="book-reveal__copy">
        <span className="section-index">03 — Memories come alive · 04 — The knowledge globe</span>
        <h2 id="book-reveal-title">What we keep begins to move.</h2>
        <p>Scroll slowly. Follow the threads between memories.</p>
      </div>
      <div className="book-reveal__legend" aria-hidden="true"><span className="book-reveal__legend-line" /><span>Scroll to remember</span></div>
      <div className="book-reveal__globe-title" aria-hidden="true"><span>Project Timeless</span><strong>Many memories.<br /><em>One shared wisdom.</em></strong></div>
      <div className="book-reveal__final-title" aria-hidden="true"><span className="book-reveal__final-kicker">A living archive for human wisdom</span><strong>PROJECT<br /><em>TIMELESS</em></strong><span className="book-reveal__final-tagline">Wisdom Should Never Disappear.</span></div>
      <div className="book-reveal__fallback" role="status">A living archive is opening.</div>
    </section>
  )
}
