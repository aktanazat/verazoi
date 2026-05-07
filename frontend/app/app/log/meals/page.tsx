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
      <div className="mb-4 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-foreground px-5 py-2 text-[12px] font-medium tracking-[0.02em] text-background transition-colors hover:bg-foreground/90"
        >
          Save meal
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Meal type</p>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {mealTypes.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="radio"
                  name="meal_type"
                  value={type}
                  defaultChecked={type === "Breakfast"}
                  className="peer sr-only"
                />
                <span className="block rounded-full border border-border bg-background/60 py-1.5 text-center text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                  {type}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">What did you eat?</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quickFoods.map((food) => (
                <label key={food} className="cursor-pointer">
                  <input type="checkbox" name="foods" value={food} className="peer sr-only" />
                  <span className="block rounded-full border border-border bg-background/60 px-3 py-1.5 text-[12px] tracking-[0.02em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background">
                    {food}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                name="custom_food"
                placeholder="Add custom food..."
                className="flex-1 rounded-full border border-border bg-background/60 px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/40 focus:outline-none"
              />
              <MealPhotoRecognition />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/40 p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Notes (optional)</p>
          <textarea
            name="notes"
            placeholder="How did you feel after eating?"
            rows={5}
            className="mt-3 w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-foreground/40 focus:outline-none"
          />
          <div className="mt-4 rounded-xl border border-border/60 bg-background/50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/80">Food insights</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground/70">
              Save this meal, then review dashboard food impact once glucose readings are available.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}
