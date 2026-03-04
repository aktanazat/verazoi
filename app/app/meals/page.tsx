"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { useAppData } from "@/contexts/app-data-context"

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"] as const
type MealType = (typeof mealTypes)[number]

const quickFoods = [
  "Oatmeal", "Eggs", "Toast", "Rice", "Chicken", "Salad",
  "Fruit", "Yogurt", "Pasta", "Fish", "Nuts", "Smoothie",
]

export default function MealsPage() {
  const { dispatch } = useAppData()
  const [mealType, setMealType] = useState<MealType>("Breakfast")
  const [selected, setSelected] = useState<string[]>([])
  const [custom, setCustom] = useState("")
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)

  const toggle = (food: string) => {
    setSelected((prev) =>
      prev.includes(food) ? prev.filter((f) => f !== food) : [...prev, food]
    )
  }

  const addCustom = () => {
    if (custom.trim() && !selected.includes(custom.trim())) {
      setSelected((prev) => [...prev, custom.trim()])
      setCustom("")
    }
  }

  const handleSave = () => {
    if (selected.length > 0) {
      dispatch({
        type: "addMeal",
        payload: {
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          mealType,
          foods: selected,
          notes,
        },
      })
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setSelected([])
        setNotes("")
      }, 2000)
    }
  }

  return (
    <div className="max-w-2xl">
      <p className="text-[12px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Log Meal
      </p>
      <h1 className="mt-3 font-serif text-[28px] font-light text-foreground">
        Meals
      </h1>

      {/* Meal type selector */}
      <div className="mt-6">
        <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          Meal type
        </label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`border py-2.5 text-[12px] tracking-[0.04em] transition-colors ${
                mealType === type
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Quick food tags */}
      <div className="mt-6">
        <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          What did you eat?
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickFoods.map((food) => {
            const active = selected.includes(food)
            return (
              <button
                key={food}
                onClick={() => toggle(food)}
                className={`border px-3.5 py-2 text-[12px] tracking-[0.02em] transition-colors ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground/30"
                }`}
              >
                {food}
              </button>
            )
          })}
        </div>

        {/* Custom food entry */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Add custom food..."
            className="flex-1 border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
          />
          <button
            onClick={addCustom}
            className="border border-border px-3 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Selected foods */}
      {selected.length > 0 && (
        <div className="mt-6">
          <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
            Selected ({selected.length})
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {selected.map((food) => (
              <span
                key={food}
                className="flex items-center gap-1.5 border border-foreground/15 bg-secondary px-3 py-1.5 text-[12px] text-foreground"
              >
                {food}
                <button onClick={() => toggle(food)}>
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mt-6">
        <label className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you feel after eating?"
          rows={3}
          className="mt-3 w-full resize-none border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/30 focus:outline-none transition-colors"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={selected.length === 0}
        className="mt-6 w-full bg-foreground py-3.5 text-[13px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85 disabled:opacity-30"
      >
        {saved ? "Saved" : "Save meal"}
      </button>
    </div>
  )
}
