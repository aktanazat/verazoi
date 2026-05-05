import { MealPhotoRecognition } from "@/components/log-async-widgets"

import { API_BASE } from "@/lib/config"

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"] as const
const quickFoods = [
  "Oatmeal", "Eggs", "Toast", "Rice", "Chicken", "Salad",
  "Fruit", "Yogurt", "Pasta", "Fish", "Nuts", "Smoothie",
]

export default function MealsLogPage() {
  return (
    <form action={`${API_BASE}/meals/form`} method="post">
      <div className="mb-5 flex justify-end">
        <button
          type="submit"
          className="border border-foreground bg-foreground px-6 py-2 text-[12px] font-medium tracking-[0.04em] text-background transition-opacity hover:opacity-85"
        >
          Save meal
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Meal type</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {mealTypes.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  name="meal_type"
                  value={type}
                  defaultChecked={type === "Breakfast"}
                  className="peer sr-only"
                />
                <span className="block border border-border py-2.5 text-center text-[12px] tracking-[0.04em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {type}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">What did you eat?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickFoods.map((food) => (
                <label key={food} className="cursor-pointer">
                  <input type="checkbox" name="foods" value={food} className="peer sr-only" />
                  <span className="block border border-border px-3.5 py-2 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {food}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                name="custom_food"
                placeholder="Add custom food..."
                className="flex-1 border border-border bg-transparent px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground/30 focus:outline-none"
              />
              <MealPhotoRecognition />
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Notes (optional)</p>
          <textarea
            name="notes"
            placeholder="How did you feel after eating?"
            rows={5}
            className="mt-3 w-full resize-none border border-border bg-transparent px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-foreground/30 focus:outline-none"
          />
          <div className="mt-5 border border-border/70 p-4">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground">Food insights</p>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground/60">
              Save this meal, then review dashboard food impact once glucose readings are available.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
