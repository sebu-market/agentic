import { Check, Circle, CircleDot } from "lucide-react"

interface StepProps {
  title: string
  isCompleted: boolean
  isActive: boolean
}

function Step({ title, isCompleted, isActive }: StepProps) {
  return (
    <div className="flex items-center mb-4">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3 ${
          isCompleted ? "bg-black border-black" : isActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        {isCompleted ? (
          <Check className="w-5 h-5 text-white" />
        ) : isActive ? (
          <CircleDot className={`w-5 h-5 ${isActive ? "text-blue-500" : "text-gray-500"}`} />
        ) : (
          <Circle className="w-5 h-5 text-gray-500" />
        )}
      </div>
      <span
        className={`text-sm ${
          isCompleted ? "text-black" : isActive ? "text-blue-500 font-semibold" : "text-gray-500"
        }`}
      >
        {title}
      </span>
    </div>
  )
}

interface StepperProps {
  steps: string[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => (
        <Step key={index} title={step} isCompleted={index < currentStep} isActive={index === currentStep} />
      ))}
    </div>
  )
}

