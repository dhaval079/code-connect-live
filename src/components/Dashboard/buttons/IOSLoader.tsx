/**
 * iOS Activity Indicator Component (Pure CSS - No Tailwind)
 * Minimal, reusable loader that mimics Apple's UIActivityIndicatorView
 *
 * Usage:
 * <IOSLoader size="medium" color="gray" />
 */

interface IOSLoaderProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'gray' | 'white' | 'blue' | 'black'
  className?: string
}

export default function IOSLoader({
  size = 'medium',
  color = 'gray',
  className = ''
}: IOSLoaderProps) {
  const sizeMap = {
    small: { width: '20px', height: '20px' },
    medium: { width: '36px', height: '36px' },
    large: { width: '56px', height: '56px' }
  };

  const colorMap = {
    gray: 'rgba(60, 60, 67, 0.95)',
    white: 'rgba(255, 255, 255, 0.95)',
    blue: 'rgba(0, 122, 255, 0.95)',
    black: 'rgba(0, 0, 0, 0.95)'
  };

  return (
    <>
      <div
        className={`ios-loader ${className}`}
        style={sizeMap[size]}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="ios-loader-bar"
            style={{
              transform: `rotate(${i * 30}deg) translate(0, -130%)`,
              animationDelay: `${-i * 0.0833}s`,
              background: colorMap[color]
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .ios-loader {
          position: relative;
          display: inline-block;
        }

        .ios-loader-bar {
          position: absolute;
          left: 49%;
          top: 43%;
          width: 8%;
          height: 26%;
          border-radius: 50px;
          opacity: 0;
          transform-origin: center;
          animation: ios-fade 1s linear infinite;
        }

        @keyframes ios-fade {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.25;
          }
        }
      `}</style>
    </>
  );
}
