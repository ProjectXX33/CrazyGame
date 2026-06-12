import { useMemo } from 'react'
import dpad from '../assets/background/d-pad-svgrepo-com.svg'
import controller from '../assets/background/game-controller-outline-svgrepo-com.svg'
import headphone from '../assets/background/headphone-svgrepo-com.svg'
import lightning from '../assets/background/lightning-1-svgrepo-com.svg'
import trophy from '../assets/background/trophy-outline-svgrepo-com.svg'
import switchIcon from '../assets/background/nintendo-switch-svgrepo-com.svg'
import playstation from '../assets/background/playstation-svgrepo-com.svg'

const icons = [dpad, controller, headphone, lightning, trophy, switchIcon, playstation]

export default function BackgroundPattern() {
  const items = useMemo(() => {
    // Shuffle the icons first
    const shuffledIcons = [...icons]
    for (let i = shuffledIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIcons[i], shuffledIcons[j]] = [shuffledIcons[j], shuffledIcons[i]]
    }

    const total = shuffledIcons.length
    
    return shuffledIcons.map((icon, i) => {
      // Alternate left and right (e.g. i=0 is Right, i=1 is Left)
      const isRight = i % 2 === 0
      
      // Vertical placement: evenly spaced down the page
      const segmentHeight = 100 / total
      // Center of this vertical segment
      const baseY = i * segmentHeight + (segmentHeight / 2)
      // Small vertical jitter
      const jitterY = (Math.random() - 0.5) * (segmentHeight * 0.4)
      
      // Horizontal placement: right side (85-95%), left side (5-15%)
      const baseX = isRight ? 90 : 10
      const jitterX = (Math.random() - 0.5) * 5

      return {
        icon,
        top: (baseY + jitterY) + '%',
        left: (baseX + jitterX) + '%',
        size: 150 + Math.random() * 100, // Significantly larger size
        rot: Math.random() * 360,
        opacity: 0.03 + Math.random() * 0.02
      }
    })
  }, [])

  return (
    <div className="bg-pattern" style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', minHeight: '100vh',
      pointerEvents: 'none', zIndex: -1, overflow: 'hidden'
    }}>
      {items.map((item, i) => (
        <img 
          key={i} 
          src={item.icon} 
          className="bg-pattern-icon"
          style={{
            position: 'absolute',
            top: item.top, left: item.left,
            width: item.size, height: item.size,
            transform: `translate(-50%, -50%) rotate(${item.rot}deg)`,
            opacity: item.opacity
          }} 
          alt="" 
        />
      ))}
    </div>
  )
}
