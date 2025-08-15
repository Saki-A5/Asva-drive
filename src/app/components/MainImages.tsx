"use client"

import Image from "next/image"
import React from "react"
interface ImageProps {
    firstImage : string
    secondImage : string
    firstHeight : number
    firstWidth : number
    secondHeight : number
    secondWidth : number
}

const MainImage: React.FC<ImageProps> = ({firstImage, secondImage, firstHeight, firstWidth, secondHeight, secondWidth}) => {

    return (
        <div className="relative ">
            <Image
            src={firstImage}
            alt="Image one"
            fill
            className="object-cover" 
            />
            
            <div>
            <Image
            src={secondImage}
            alt="image two"
            fill
            className="object-cover" 
            />
            </div>
        </div>
    )
}

export default MainImage