// Tests for the SM-2 scheduler. Run with `npm test` (Node's built-in runner —
// no extra dependency). The scheduler is the one place a silent bug would
// quietly corrupt every user's review timing, so it gets real coverage.

import { test } from "node:test";
import assert from "node:assert/strict";
import { schedule, newSchedule, isDue, GRADES, DAY, MIN_EASE } from "./sm2.js";

const T0 = 1_700_000_000_000; // fixed epoch for determinism

test("new card is due immediately", () => {
  const s = newSchedule(T0);
  assert.equal(s.reps, 0);
  assert.ok(isDue(s, T0));
});

test("first Good review schedules 1 day out", () => {
  const s = schedule(newSchedule(T0), GRADES.good, T0);
  assert.equal(s.reps, 1);
  assert.equal(s.interval, 1);
  assert.equal(s.due, T0 + 1 * DAY);
});

test("second Good review schedules 6 days out", () => {
  let s = schedule(newSchedule(T0), GRADES.good, T0);
  s = schedule(s, GRADES.good, T0 + DAY);
  assert.equal(s.reps, 2);
  assert.equal(s.interval, 6);
});

test("third Good review multiplies by ease", () => {
  let s = schedule(newSchedule(T0), GRADES.good, T0);
  s = schedule(s, GRADES.good, T0 + DAY);
  const easeBefore = s.ease;
  s = schedule(s, GRADES.good, T0 + 7 * DAY);
  assert.equal(s.reps, 3);
  assert.equal(s.interval, Math.round(6 * s.ease));
  assert.ok(s.ease >= easeBefore - 0.001); // Good keeps ease ~stable
});

test("Again resets reps, adds a lapse, and ease drops", () => {
  let s = schedule(newSchedule(T0), GRADES.good, T0);
  s = schedule(s, GRADES.good, T0 + DAY); // reps=2, ease 2.5
  const easeBefore = s.ease;
  s = schedule(s, GRADES.again, T0 + 7 * DAY);
  assert.equal(s.reps, 0);
  assert.equal(s.lapses, 1);
  assert.equal(s.interval, 1);
  assert.ok(s.ease < easeBefore);
});

test("ease never drops below the floor", () => {
  let s = newSchedule(T0);
  for (let i = 0; i < 20; i++) s = schedule(s, GRADES.again, T0 + i * DAY);
  assert.ok(s.ease >= MIN_EASE);
});

test("Easy stretches the interval more than Good", () => {
  let base = schedule(newSchedule(T0), GRADES.good, T0);
  base = schedule(base, GRADES.good, T0 + DAY); // reps=2 -> interval 6
  const good = schedule(base, GRADES.good, T0 + 7 * DAY);
  const easy = schedule(base, GRADES.easy, T0 + 7 * DAY);
  assert.ok(easy.interval > good.interval);
});

test("Hard shortens the interval relative to Good", () => {
  let base = schedule(newSchedule(T0), GRADES.good, T0);
  base = schedule(base, GRADES.good, T0 + DAY);
  const good = schedule(base, GRADES.good, T0 + 7 * DAY);
  const hard = schedule(base, GRADES.hard, T0 + 7 * DAY);
  assert.ok(hard.interval < good.interval);
});
