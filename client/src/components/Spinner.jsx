export default function Spinner({ size = 'md' }) {
  const cls = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' }[size]
  return (
    <div className={`${cls} animate-spin rounded-full border-[#4fd1ff]/20 border-t-[#4fd1ff]`} />
  )
}
