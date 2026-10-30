# Menu photos

Drop a photo here named after the menu item's ID and it appears on the menu automatically:

    app/public/menu/<item-id>.jpg

For example `jerk-chicken.jpg` or `kale-salad.jpg`. Item IDs are in `app/src/data/menu.ts`
(the `id:` of each entry). Use 4:3 photos (for example 1200 x 900) so they fill the card.
Until a file exists, the menu shows a "?" tile.
