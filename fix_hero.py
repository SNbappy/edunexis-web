FILE = 'src/features/courses/pages/CourseDetailPage.tsx'

content = open(FILE, encoding='utf-8').read()

# 1. Add useRef to the react-router-dom import line area (add useRef to useState import)
content = content.replace(
    "import { useState } from 'react'",
    "import { useState, useEffect, useRef } from 'react'"
)

# 2. Add ChevronDown to lucide imports
content = content.replace(
    "  GraduationCap, Layers",
    "  GraduationCap, Layers, ChevronDown, ChevronUp"
)

# 3. Replace the collapsed state + hero section opener
# Add headerCollapsed state after [editOpen, setEditOpen]
content = content.replace(
    "  const [editOpen, setEditOpen] = useState(false)",
    "  const [editOpen, setEditOpen] = useState(false)\n  const [headerCollapsed, setHeaderCollapsed] = useState(false)\n  const heroRef = useRef<HTMLDivElement>(null)"
)

# 4. Add scroll listener after the useState block (after the guards)
scroll_listener = """
  useEffect(() => {
    const onScroll = () => setHeaderCollapsed(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
"""

content = content.replace(
    "  const renderTab = () => {",
    scroll_listener + "\n  const renderTab = () => {"
)

# 5. Replace the cover image div to be collapsible
content = content.replace(
    '        {/* Cover image */}\n        <div className="relative h-52 lg:h-64 overflow-hidden">',
    '        {/* Cover image - collapses on scroll */}\n        <motion.div\n          animate={{ height: headerCollapsed ? 0 : undefined }}\n          transition={{ duration: 0.35, ease: [0.4,0,0.2,1] }}\n          className="relative overflow-hidden"\n          style={{ height: headerCollapsed ? 0 : undefined }}\n          initial={false}>'
)
content = content.replace(
    '          {/* Fade to page bg */}\n          <div className="absolute inset-0"\n            style={{ background: \'linear-gradient(to bottom,rgba(6,13,31,0.15) 0%,rgba(6,13,31,0.6) 55%,#060d1f 100%)\' }} />\n          <div className="absolute inset-0"\n            style={{ background: \'linear-gradient(to right,rgba(6,13,31,0.55) 0%,transparent 55%)\' }} />\n        </div>',
    '          {/* Fade to page bg */}\n          <div className="absolute inset-0"\n            style={{ background: \'linear-gradient(to bottom,rgba(6,13,31,0.15) 0%,rgba(6,13,31,0.6) 55%,#060d1f 100%)\' }} />\n          <div className="absolute inset-0"\n            style={{ background: \'linear-gradient(to right,rgba(6,13,31,0.55) 0%,transparent 55%)\' }} />\n        </motion.div>'
)

# 6. Replace hero content wrapper to animate when collapsed
content = content.replace(
    '        {/* Hero content */}\n        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">\n          <div className="-mt-24 pb-0">',
    '        {/* Hero content */}\n        <motion.div\n          ref={heroRef}\n          animate={{ marginTop: headerCollapsed ? 0 : undefined, opacity: headerCollapsed ? 0 : 1, height: headerCollapsed ? 0 : \'auto\', overflow: \'hidden\' }}\n          transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}\n          initial={false}\n          className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">\n          <div className="-mt-24 pb-0">'
)
content = content.replace(
    '          </div>\n        </div>\n\n        {/* \u2500\u2500 TAB NAVIGATION',
    '          </div>\n        </motion.div>\n\n        {/* \u2500\u2500 TAB NAVIGATION'
)

# 7. Add compact collapsed bar BEFORE the tab nav sticky div
compact_bar = """        {/* Compact bar shown when collapsed */}
        {headerCollapsed && (
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-2 flex items-center gap-3">
            <span className="text-sm font-bold truncate" style={{ color: '#e2e8f0' }}>{course.title}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              {course.courseCode}
            </span>
            <button onClick={() => { setHeaderCollapsed(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="ml-auto flex items-center gap-1 text-[11px] font-bold shrink-0 px-2 py-1 rounded-lg transition-all"
              style={{ color: '#475569', border: '1px solid rgba(99,102,241,0.15)' }}>
              <ChevronDown className="w-3.5 h-3.5" /> Expand
            </button>
          </div>
        )}
"""

content = content.replace(
    '        {/* \u2500\u2500 TAB NAVIGATION \u2500\u2500 */}\n        <div className="sticky top-0 z-20"',
    compact_bar + '        {/* \u2500\u2500 TAB NAVIGATION \u2500\u2500 */}\n        <div className="sticky top-0 z-20"'
)

open(FILE, 'w', encoding='utf-8').write(content)
print('Done')
