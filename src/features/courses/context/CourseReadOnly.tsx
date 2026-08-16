import { createContext, useContext } from "react"

/**
 * Whether the course currently on screen refuses writes.
 *
 * Archiving freezes a course: everyone keeps full read access to everything it
 * ever held, but nothing can be added, edited or removed until the teacher
 * unarchives it. The server enforces that (any write returns 409), so this
 * context is not the security boundary — it exists so the interface tells the
 * truth *before* someone fills in a form and gets rejected on submit.
 *
 * A context rather than prop-drilling because eight tabs and their nested
 * cards, modals and menus all need the answer, and passing it by hand through
 * every one of them is how a stray "New assignment" button survives.
 */
const CourseReadOnlyContext = createContext(false)

export function CourseReadOnlyProvider({
  readOnly, children,
}: {
  readOnly: boolean
  children: React.ReactNode
}) {
  return (
    <CourseReadOnlyContext.Provider value={readOnly}>
      {children}
    </CourseReadOnlyContext.Provider>
  )
}

/** True when the course is archived and every write is refused. */
export function useCourseReadOnly() {
  return useContext(CourseReadOnlyContext)
}
