import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <h1 className="text-6xl font-bold text-white mb-6">
            4D Sudoku
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"> Explorer</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl">
            Experience Sudoku in four dimensions. Choose your visualization approach and solve puzzles that extend beyond our 3D perception.
          </p>
        </div>
      </div>

      {/* Views Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-8">Visualization Approaches</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tessaract View */}
          <Link
            href="/tessaract"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900 to-purple-800 p-8 hover:shadow-2xl hover:shadow-purple-500/50 transition duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-cyan-400/0 group-hover:from-purple-400/10 group-hover:to-cyan-400/10 transition"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold text-white mb-3">Tessaract View</h3>
              <p className="text-gray-200 mb-4">
                Pure 4D mathematics. Watch a hypercube rotate in 4D space with cells represented as points. Advanced visualization.
              </p>
              <div className="flex items-center text-cyan-400 group-hover:gap-2 transition">
                <span>Explore</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </div>
            </div>
          </Link>

          {/* Option 2: Multi-Cube */}
          <Link
            href="/option-2"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900 to-blue-800 p-8 hover:shadow-2xl hover:shadow-blue-500/50 transition duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 transition"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-2xl font-bold text-white mb-3">Multi-Cube Grid</h3>
              <p className="text-gray-200 mb-4">
                9 interactive 3D cubes arranged in a 3×3 grid. Each cube represents a layer along the W dimension. Most intuitive.
              </p>
              <div className="flex items-center text-cyan-400 group-hover:gap-2 transition">
                <span>Explore</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </div>
            </div>
          </Link>

          {/* Original Tessaract Demo */}
          <Link
            href="/"
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900 to-cyan-800 p-8 hover:shadow-2xl hover:shadow-cyan-500/50 transition duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-blue-400/0 group-hover:from-cyan-400/10 group-hover:to-blue-400/10 transition"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-bold text-white mb-3">Rotating Tessaract</h3>
              <p className="text-gray-200 mb-4">
                Pure geometric visualization. Watch a 4D hypercube rotate with 16 vertices and 32 edges. Tech demo.
              </p>
              <div className="flex items-center text-cyan-400 group-hover:gap-2 transition">
                <span>Explore</span>
                <span className="opacity-0 group-hover:opacity-100 transition">→</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-cyan-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">What is 4D Sudoku?</h3>
            <p className="text-gray-300 mb-4">
              4D Sudoku extends traditional Sudoku into a fourth spatial dimension. A puzzle consists of a 9×9×9×9 hypercube (6,561 cells total).
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>✓ 9 standard 2D Sudoku rules apply in each 3D layer</li>
              <li>✓ Numbers must be unique across the 4th dimension (W-axis)</li>
              <li>✓ Total of 6,561 cells to fill</li>
              <li>✓ Exponentially more challenging than 3D</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-cyan-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Choose Your View</h3>
            <p className="text-gray-300 mb-4">
              Different approaches reveal different aspects of the 4D puzzle:
            </p>
            <ul className="space-y-2 text-gray-300">
              <li><span className="text-cyan-400">Tessaract:</span> Mathematical authenticity</li>
              <li><span className="text-cyan-400">Multi-Cube:</span> Intuitive gameplay</li>
              <li><span className="text-cyan-400">Rotating:</span> Visual exploration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
          <p>Pushing the boundaries of puzzle gaming into the fourth dimension</p>
        </div>
      </div>
    </div>
  );
}
