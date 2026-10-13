# Spoonfed Current Workflow Notes

Observed October 13, 2026 from Pearl Island2GO's current GetSpoonfed ordering flow. Use this to ground the demo menu and workflow, but keep all prototype data labeled as illustrative until Sober confirms it.

## Bottom line

The current system is a date/time-based catering menu with per-serving items, category tabs, expandable item descriptions, dietary tags, quantity steppers, required catering supplies, and a basic order summary; the prototype should preserve those operational concepts while improving guidance, review, and handoff.

## Observed customer workflow

1. Start order
   - Customer chooses Standard Order or Group Order.
   - Customer chooses Delivery or Pick-up.
   - Flow shows Location as Zone 1.
   - Customer chooses date and pickup/delivery time.
   - Public note says orders over 50 guests should contact `info@pearlislandcatering.com` with 5 business days notice.

2. Menu selection
   - Categories shown: Sides, Salads, Entrees, Disposable Catering Supplies.
   - Customer selects items for a chosen time slot.
   - Customer can add another time slot.
   - Time choices observed around the selected slot include 1:00 pm through 5:30 pm in 30-minute increments, plus the existing 1:30 pm selection.

3. Item selection
   - Menu pages use expandable sections.
   - Items have prices, quantity controls, and dietary icons.
   - Some items expose descriptions only after expanding the row.
   - The order summary stays available separately and starts empty until items are added.

4. Required supplies
   - Disposable catering supplies are presented as a required $0 parent item.
   - Customer must either select no supplies needed or choose priced supply options.

## Observed menu structure

### Sides

Category notes:
- 6oz serving size for each spooned menu item.
- Plantains are 2 per serving.

Vegan Rice Options:

| Item | Price | Tags observed | Description observed |
|---|---:|---|---|
| Tropical Fried Rice | $4.25 | Vegetarian | Turmeric stewed rice with papaya, pineapple, carrots, peas, onions and peppers |
| Rice w/ Pigeon Peas | $2.76 | Vegetarian | Not expanded |
| Brown Rice, Red Quinoa & Lima Beans | $2.75 | Vegan, Gluten Free, Dairy Free | Not expanded |
| Yellow Rice | $2.75 | Vegetarian | Not expanded |
| White Rice | $2.50 | Vegetarian | Not expanded |

More Sides:

| Item | Price | Tags observed |
|---|---:|---|
| Pearl Island Mac and Cheese | $4.25 | Vegetarian |
| Roasted Vegetables | $4.75 | None captured |
| Tostones | $2.50 | None captured |
| Amarillos | $2.75 | Vegan, Gluten Free, Dairy Free |
| Pikliz - 2oz | $1.00 | Vegan, Gluten Free, Dairy Free |
| Aioli - 16oz Bottle | $9.25 | Vegetarian |
| Vegan Aioli - 16oz Bottle | $9.00 | None captured |
| Southern Roasted Vegetables | $5.25 | None captured |
| PI Collard Greens | $3.75 | Vegan, Gluten Free, Dairy Free |

### Salads

| Item | Price | Description observed |
|---|---:|---|
| Kale Salad | $3.75 | Organic Kale, pan-roasted mushrooms, carrots and watermelon radish served with Pearl Island's Shallot Vinaigrette |
| Medley Salad | $4.75 | Organic Mixed Greens, Kale and Baby Spinach tossed with Rainbow Peppers English Cucumbers and Heirloom Tomatoes, served with Pearl Island's Shallot Vinaigrette |

### Entrees

Category notes:
- Caribbean Entrees.
- Priced per serving.
- Serving size: 6oz spoon.

| Item | Price | Tags observed | Description observed |
|---|---:|---|---|
| Slow Roasted Pork | $6.25 | Gluten Free, Dairy Free | Pearl Island's award-winning slow roasted pork with oregano, garlic, lemon and culantro marinade |
| Sous Poulet Chicken | $5.00 | Gluten Free, Dairy Free | Not expanded |
| Curry Chicken | $5.00 | Gluten Free, Dairy Free | Not expanded |
| Jerk Chicken | $5.00 | Gluten Free, Dairy Free | Not expanded |
| Curry Tofu | $5.25 | Vegan, Gluten Free | Not expanded |
| Creole Beans | $5.25 | Vegan, Gluten Free | Not expanded |
| Jerk Tofu | $5.25 | Vegetarian, Gluten Free | Not expanded |

### Disposable Catering Supplies

Parent item:
- Cutlery, Plates, Serving Utensils.
- Required.
- $0.00.
- Customer instructions say to enter package quantity and choose options, or enter quantity 1 and choose no supplies needed.

Options:

| Option | Price modifier |
|---|---:|
| No Cutlery, Plates, Serving Utensils Needed | $0.00 |
| Plates, Cutlery, Cups (priced per person) | +$2.00 |
| Plates & Cutlery (priced per person) | +$1.50 |
| Cups (priced per person) | +$0.50 |
| Cutlery Pack (priced per person) | +$0.75 |
| Serving Spoons | +$1.00 |
| Serving Tongs | +$1.00 |
| Disposable Chaffing Set (per set) | +$15.00 |

## Prototype implications

- Shift the sample menu away from generic trays and toward per-serving 6oz catering portions.
- Keep the over-50-guests and 5-business-days note as a hard review flag in the rules engine.
- Treat catering supplies as a required section in the recommendation/review flow.
- Use dietary labels only as observed tags, not as nutrition or allergy claims.
- Model multiple time slots in the data shape if easy, but do not let it expand v1 scope unless needed for the demo.
- Keep every price, serving rule, policy, and dietary tag visibly marked as an assumption until Sober confirms it.

## Still unknown

- Full descriptions for every menu item.
- Whether the observed prices are final, current, or complete.
- Whether Spoonfed's serving units match Pearl Island's internal prep units.
- How staff handles large, short-notice, custom, or multi-time-slot orders after submission.
