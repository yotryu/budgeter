import ExpenseItem from "./ExpenseItem"
import { IncomeItem } from "./IncomeItem";

export interface PeriodItem
{
	name: string
	weeks: number,
	expenses: ExpenseItem[],
	income: IncomeItem[]
};

export function getPeriodExpensesTotal(period: PeriodItem): number
{
	let total = 0;
	period.expenses.forEach((item) =>
	{
		total += item.amount;
	});

	return total;
}

export function getPeriodIncomeTotal(period: PeriodItem): number
{
	let total = 0;
	period.income.forEach((item) =>
	{
		total += item.amount;
	});

	return total;
}