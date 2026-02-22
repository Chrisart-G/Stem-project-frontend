// src/Component/Home.jsx

const MAROON = "#7b1113";

export default function Home({ onStudentLogin, onAdminLogin }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop / large-screen vertical maroon bar */}
      <aside
        className="hidden md:flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: MAROON, width: "88px", minWidth: "88px" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.25em] text-white [writing-mode:vertical-rl] rotate-180 text-center">
          HINIGARAN NATIONAL HIGH SCHOOL
        </p>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center py-8 sm:py-10 lg:py-0">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
            {/* Mobile top maroon bar (instead of vertical sidebar) */}
            <div
              className="md:hidden mb-8 flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm"
              style={{ backgroundColor: MAROON }}
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white uppercase">
                Hinigaran National High School
              </p>
            </div>

            {/* Main card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-100 px-5 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12">
              {/* Top logo + school info */}
              <header className="flex items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden ring-2 ring-slate-200">
                    <span className="text-[10px] sm:text-xs text-slate-500">
                      LOGO
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-[0.18em]">
                      Hinigaran National High School
                    </p>
                    <p className="text-sm sm:text-base text-slate-700">
                      Eco-friendly rewards for student recyclers
                    </p>
                  </div>
                </div>
              </header>

              {/* Eco Coins title + description */}
              <section className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 md:gap-12 mb-8 sm:mb-10 lg:mb-12">
                {/* Title block */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-slate-900">
                    Eco
                    <span className="block">Coins</span>
                  </h1>
                  <div
                    className="h-1 w-16 rounded-full"
                    style={{ backgroundColor: MAROON }}
                  />
                </div>

                {/* Description block */}
                <div className="max-w-md space-y-3">
                  <p className="text-sm sm:text-base text-slate-600">
                    A smart bottle recycling rewards system for students. Turn
                    plastic bottles into points that can be redeemed for perks
                    and recognition.
                  </p>
                  <ul className="text-xs sm:text-sm text-slate-500 space-y-1.5">
                    <li>• Track bottle deposits in real time</li>
                    <li>• Earn points for every accepted bottle</li>
                    <li>• View your progress and achievements</li>
                  </ul>
                </div>
              </section>

              {/* Login buttons */}
              <section className="border-t border-slate-100 pt-6 sm:pt-8">
                <p className="text-xs sm:text-sm font-medium text-slate-700 mb-3 sm:mb-4 uppercase tracking-[0.18em]">
                  Choose Login Type
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {/* Student Login */}
                  <button
                    type="button"
                    onClick={onStudentLogin}
                    className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-sm hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition"
                    style={{ backgroundColor: MAROON }}
                  >
                    Student Login
                  </button>

                  {/* Admin Login */}
                  <button
                    type="button"
                    onClick={onAdminLogin}
                    className="flex-1 inline-flex items-center justify-center rounded-xl px-4 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white bg-slate-900 shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 transition"
                  >
                    Admin Login
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}