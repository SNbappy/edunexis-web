import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './Sidebar'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: Props) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50 lg:hidden"
                    >
                        <Sidebar onClose={onClose} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
