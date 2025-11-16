import { db, generateId, type Income, type Expense, type Task, type Weight, type Exercise, type Meal } from './schema'
import { DataEvents, DATA_EVENTS } from '../events'

// Re-export types for convenience
export type { Income, Expense, Task, Weight, Exercise, Meal } from './schema'

// Income Operations
export async function addIncome(income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.income.add({
    ...income,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
  return id
}

export async function getIncome(id: string) {
  return await db.income.get(id)
}

export async function getAllIncome() {
  return await db.income.orderBy('date').reverse().toArray()
}

export async function updateIncome(id: string, updates: Partial<Income>) {
  await db.income.update(id, {
    ...updates,
    updatedAt: new Date()
  })
  DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
}

export async function deleteIncome(id: string) {
  await db.income.delete(id)
  DataEvents.emit(DATA_EVENTS.INCOME_CHANGED)
}

// Expense Operations
export async function addExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.expenses.add({
    ...expense,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
  return id
}

export async function getAllExpenses() {
  return await db.expenses.orderBy('date').reverse().toArray()
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  await db.expenses.update(id, {
    ...updates,
    updatedAt: new Date()
  })
  DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
}

export async function deleteExpense(id: string) {
  await db.expenses.delete(id)
  DataEvents.emit(DATA_EVENTS.EXPENSE_CHANGED)
}

// Task Operations
export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.tasks.add({
    ...task,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
  return id
}

export async function getAllTasks() {
  return await db.tasks.orderBy('createdAt').reverse().toArray()
}

export async function getPendingTasks() {
  return await db.tasks.filter(task => !task.completed).toArray()
}

export async function updateTask(id: string, updates: Partial<Task>) {
  await db.tasks.update(id, {
    ...updates,
    updatedAt: new Date()
  })
  DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
}

export async function toggleTaskCompletion(id: string) {
  const task = await db.tasks.get(id)
  if (!task) return
  
  await db.tasks.update(id, {
    completed: !task.completed,
    completedAt: !task.completed ? new Date() : undefined,
    updatedAt: new Date()
  })
  DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id)
  DataEvents.emit(DATA_EVENTS.TASK_CHANGED)
}

// Weight Operations
export async function addWeight(weight: Omit<Weight, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.weight.add({
    ...weight,
    id,
    createdAt: new Date()
  })
  
  DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
  return id
}

export async function getAllWeight() {
  return await db.weight.orderBy('date').reverse().toArray()
}

export async function updateWeight(id: string, updates: Partial<Weight>) {
  await db.weight.update(id, updates)
  DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
}

export async function deleteWeight(id: string) {
  await db.weight.delete(id)
  DataEvents.emit(DATA_EVENTS.WEIGHT_CHANGED)
}

// Exercise Operations
export async function addExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.exercise.add({
    ...exercise,
    id,
    createdAt: new Date()
  })
  
  DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
  return id
}

export async function getAllExercise() {
  return await db.exercise.orderBy('date').reverse().toArray()
}

export async function updateExercise(id: string, updates: Partial<Exercise>) {
  await db.exercise.update(id, updates)
  DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
}

export async function deleteExercise(id: string) {
  await db.exercise.delete(id)
  DataEvents.emit(DATA_EVENTS.EXERCISE_CHANGED)
}

// Meal Operations
export async function addMeal(meal: Omit<Meal, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.meals.add({
    ...meal,
    id,
    createdAt: new Date()
  })
  
  DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
  return id
}

export async function getAllMeals() {
  return await db.meals.orderBy('date').reverse().toArray()
}

export async function updateMeal(id: string, updates: Partial<Meal>) {
  await db.meals.update(id, updates)
  DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
}

export async function deleteMeal(id: string) {
  await db.meals.delete(id)
  DataEvents.emit(DATA_EVENTS.MEAL_CHANGED)
}

// Statistics
export async function getMonthlyIncome(year: number, month: number) {
  // Create date range for the month
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  
  // Use indexed query on date field for better performance
  const monthlyIncome = await db.income
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
  
  return monthlyIncome.reduce((sum, item) => sum + item.amount, 0)
}

export async function getMonthlyExpenses(year: number, month: number) {
  // Create date range for the month
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0, 23, 59, 59)
  
  // Use indexed query on date field for better performance
  const monthlyExpenses = await db.expenses
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray()
  
  return monthlyExpenses.reduce((sum, item) => sum + item.amount, 0)
}

export async function getTotalBalance() {
  const allIncome = await db.income.toArray()
  const allExpenses = await db.expenses.toArray()
  
  const totalIncome = allIncome.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = allExpenses.reduce((sum, item) => sum + item.amount, 0)
  
  return totalIncome - totalExpenses
}

export async function getTasksCompletedToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Use compound index on completed field for faster filtering
  const completedTasks = await db.tasks
    .where('completed')
    .equals(1)
    .filter(task => {
      if (!task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })
    .count()
  
  return completedTasks
}

export async function getTotalTasksToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Use dueDate index for faster filtering
  const todaysTasks = await db.tasks
    .where('dueDate')
    .between(today, tomorrow, true, false)
    .count()
  
  return todaysTasks
}

// Routine Operations
export async function addRoutine(routine: Omit<import('./schema').Routine, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = generateId()
  const now = new Date()
  
  await db.routines.add({
    ...routine,
    id,
    createdAt: now,
    updatedAt: now
  })
  
  DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
  return id
}

export async function getAllRoutines() {
  return await db.routines.orderBy('createdAt').toArray()
}

export async function getRoutinesByTime(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night') {
  return await db.routines.filter(r => r.timeOfDay === timeOfDay).toArray()
}

export async function updateRoutine(id: string, updates: Partial<import('./schema').Routine>) {
  await db.routines.update(id, {
    ...updates,
    updatedAt: new Date()
  })
  DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
}

export async function deleteRoutine(id: string) {
  await db.routines.delete(id)
  // Also delete all completions for this routine
  const completions = await db.routineCompletions.filter(c => c.routineId === id).toArray()
  for (const completion of completions) {
    if (completion.id) await db.routineCompletions.delete(completion.id)
  }
  DataEvents.emit(DATA_EVENTS.ROUTINE_CHANGED)
  DataEvents.emit(DATA_EVENTS.ROUTINE_COMPLETION_CHANGED)
}

export async function addRoutineCompletion(completion: Omit<import('./schema').RoutineCompletion, 'id' | 'createdAt'>) {
  const id = generateId()
  
  await db.routineCompletions.add({
    ...completion,
    id,
    createdAt: new Date()
  })
  
  DataEvents.emit(DATA_EVENTS.ROUTINE_COMPLETION_CHANGED)
  return id
}

export async function getTodayRoutineCompletion(routineId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const completions = await db.routineCompletions
    .filter(c => c.routineId === routineId)
    .toArray()
  
  return completions.find(c => {
    const compDate = new Date(c.date)
    compDate.setHours(0, 0, 0, 0)
    return compDate.getTime() === today.getTime()
  })
}

export async function getRoutineStreak(routineId: string) {
  const completions = await db.routineCompletions
    .filter(c => c.routineId === routineId)
    .toArray()
  
  if (completions.length === 0) return 0
  
  // Sort by date descending
  completions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < completions.length; i++) {
    const compDate = new Date(completions[i].date)
    compDate.setHours(0, 0, 0, 0)
    
    const expectedDate = new Date(today)
    expectedDate.setDate(expectedDate.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)
    
    if (compDate.getTime() === expectedDate.getTime() && completions[i].completionRate === 100) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}
