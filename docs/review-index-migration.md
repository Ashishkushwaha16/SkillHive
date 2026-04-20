# Review Index Migration Note

## Why this exists

Older deployments may still have a legacy unique index on:

- `mentorId_1_learnerId_1`

Current code uses `reviewer/reviewee` fields and writes legacy fields for backward compatibility. If the stale index remains, rating upserts may fail with duplicate key errors.

## Symptoms

Typical error:

- `E11000 duplicate key error collection: skillhive.reviews index: mentorId_1_learnerId_1 dup key: { mentorId: null, learnerId: null }`

## Safe migration steps

Run these commands in Mongo shell on the target database.

1) Inspect current indexes

```javascript
db.reviews.getIndexes()
```

2) Optional: inspect duplicate legacy pairs before index changes

```javascript
db.reviews.aggregate([
  {
    $group: {
      _id: { mentorId: "$mentorId", learnerId: "$learnerId" },
      count: { $sum: 1 },
      ids: { $push: "$_id" },
    },
  },
  { $match: { count: { $gt: 1 } } },
])
```

3) Drop stale legacy index if present

```javascript
db.reviews.dropIndex("mentorId_1_learnerId_1")
```

4) Verify indexes again

```javascript
db.reviews.getIndexes()
```

5) Restart backend so startup index sync can apply current schema indexes.

## Notes

- Backend startup now attempts `Review.syncIndexes()` and logs a warning if index sync is not permitted.
- This migration is safe to run multiple times as long as index existence is checked first.
