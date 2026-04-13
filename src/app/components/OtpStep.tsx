// "use client";

// import { useState, useRef } from "react";
// import axios from "axios";

// interface OtpStepProps {
//   email: string;
//   nextStep: () => void;
// }

// export default function OtpStep({ email, nextStep }: OtpStepProps) {
//   const [digits, setDigits] = useState(["", "", "", "", "", ""]);
//   const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

//   const handleChange = (value: string, index: number) => {
//     if (!/^\d?$/.test(value)) return;

//     const firstEmptyIndex = digits.findIndex((d) => d === "");
//     if (index !== firstEmptyIndex) {
//       inputsRef.current[firstEmptyIndex]?.focus();
//       return;
//     }

//     const newDigits = [...digits];
//     newDigits[index] = value;
//     setDigits(newDigits);

//     if (value && index < 5) {
//       inputsRef.current[index + 1]?.focus();
//     }

//     if (newDigits.every((d) => d !== "")) {
//       verifyOtp(newDigits.join(""));
//     }
//   };

//   const handleKeyDown = (e: any, index: number) => {
//     if (e.key === "Backspace" && !digits[index] && index > 0) {
//       inputsRef.current[index - 1]?.focus();
//     }
//   };

//   const verifyOtp = async (otp: string) => {
//     try {
//       await axios.post("/api/auth/verify-otp", { email, otp });
//       nextStep();
//     } catch (error) {
//       alert("Invalid OTP");
//       setDigits(["", "", "", "", "", ""]);
//       inputsRef.current[0]?.focus();
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-[calc(100vh-80px)] w-full">
//       <div className="flex flex-col items-center">
//         <h2 className="text-center text-xl font-bold mb-6">
//           Enter the 6-digit code sent to{" "}
//           <span className="text-[#155dfc]">{email}</span>
//         </h2>

//         <div className="flex gap-3">
//           {digits.map((digit, i) => (
//             <input
//               key={i}
//               ref={(el) => {
//                 inputsRef.current[i] = el;
//               }}
//               type="text"
//               maxLength={1}
//               value={digit}
//               onChange={(e) => handleChange(e.target.value, i)}
//               onKeyDown={(e) => handleKeyDown(e, i)}
//               className="w-16 h-16 text-center text-xl border rounded-md focus:ring-2 focus:ring-green-500"
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useRef } from "react";
import axios from "axios";

export default function OtpStep({ email, nextStep }: any) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
    if (newDigits.every((d) => d !== "")) verifyOtp(newDigits.join(""));
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !digits[index] && index > 0)
      inputsRef.current[index - 1]?.focus();
  };

  const verifyOtp = async (otp: string) => {
    try {
      await axios.post("/api/auth/verify-otp", { email, otp });
      nextStep();
    } catch (error) {
      alert("Invalid OTP");
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center py-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Verify your email
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Enter the code sent to{" "}
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {email}
          </span>
        </p>
      </div>

      <div className="flex gap-2 sm:gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950 focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white transition-all outline-none"
          />
        ))}
      </div>

      <button
        onClick={() => setDigits(["", "", "", "", "", ""])}
        className="mt-8 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors">
        Clear and try again
      </button>
    </div>
  );
}
