"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useImperativeHandle } from "react"

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: "hours" | "minutes" | "seconds"
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  onLeftFocus?: () => void
  onRightFocus?: () => void
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = "number",
      picker,
      date,
      setDate,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState<boolean>(false)
    const [prev, setPrev] = React.useState<string | number>("")
    const inputRef = React.useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => inputRef.current!, [])

    const getPickerValue = React.useCallback(
      (date: Date | undefined) => {
        if (!date) return ""
        if (picker === "hours") return date.getHours()
        if (picker === "minutes") return date.getMinutes()
        if (picker === "seconds") return date.getSeconds()
        return ""
      },
      [picker]
    )

    const [value, setValue] = React.useState<string | number>(
      getPickerValue(date)
    )

    React.useEffect(() => {
      setValue(getPickerValue(date))
    }, [date, getPickerValue])

    const Dictionnary = {
      hours: { max: 23, min: 0 },
      minutes: { max: 59, min: 0 },
      seconds: { max: 59, min: 0 },
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.select()
      setPrev(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowRight") onRightFocus?.()
      if (e.key === "ArrowLeft") onLeftFocus?.()
    }

    const addLeadingZero = (value: number) => {
      return value < 10 ? `0${value}` : value
    }

    const updateDate = (value: number) => {
      const newDate = date ? new Date(date) : new Date()
      if (picker === "hours") newDate.setHours(value)
      if (picker === "minutes") newDate.setMinutes(value)
      if (picker === "seconds") newDate.setSeconds(value)
      setDate(newDate)
      return newDate
    }

    const onBlur = () => {
      if (value === "") {
        const newDate = updateDate(0)
        setValue(addLeadingZero(getPickerValue(newDate) as number))
        return
      }

      const parsedValue = parseInt(value as string, 10)
      if (isNaN(parsedValue)) {
        const newDate = updateDate(0)
        setValue(addLeadingZero(getPickerValue(newDate) as number))
        return
      }
      if (parsedValue > Dictionnary[picker].max) {
        const newDate = updateDate(Dictionnary[picker].max)
        setValue(addLeadingZero(getPickerValue(newDate) as number))
        return
      }
      if (parsedValue < Dictionnary[picker].min) {
        const newDate = updateDate(Dictionnary[picker].min)
        setValue(addLeadingZero(getPickerValue(newDate) as number))
        return
      }
      const newDate = updateDate(parsedValue)
      setValue(addLeadingZero(getPickerValue(newDate) as number))
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === "") {
        setValue("")
        return
      }
      if (Number.isNaN(parseInt(val, 10))) return
      if (parseInt(val, 10) > Dictionnary[picker].max) return
      if (parseInt(val, 10) < 0) return
      setValue(val)
    }

    return (
      <Input
        ref={inputRef}
        id={picker}
        name={picker}
        value={value}
        onChange={onChange}
        type={type}
        onFocus={handleFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-[48px] text-center font-mono text-base tabular-nums caret-transparent selection:bg-transparent focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      />
    )
  }
)

TimePickerInput.displayName = "TimePickerInput"

export { TimePickerInput }
