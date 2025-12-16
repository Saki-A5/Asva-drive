"use client"
import { useEffect, useState } from "react"

const Loading = () => {

  const words = ["Asva Drive"]
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let typeSpeed = 150

    if (isDeleting) {
      typeSpeed = 80
    }

    const handleTyping = () => {
      if (!isDeleting && charIndex < currentWord.length) {
        setDisplayText(currentWord.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentWord.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      } else if (!isDeleting && charIndex === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1000)
        return
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        return
      }
    }

    const timer = setTimeout(handleTyping, typeSpeed)
    return () => clearTimeout(timer)
  }, 
[charIndex, isDeleting, currentWordIndex])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-lg font-medium">{displayText}</p>
    </div>
  );
}

export default Loading