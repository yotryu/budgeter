import ExpenseItem from "./ExpenseItem"
import { IncomeItem } from "./IncomeItem";
import LoanItem from "./LoanItem";

export interface PeriodItem
{
	name: string
	weeks: number,
	expenses: ExpenseItem[],
	income: IncomeItem[]
};

export function getPeriodExpensesTotal(period: PeriodItem, loans: LoanItem[]): number
{
	let total = 0;
	period.expenses.forEach((item) =>
	{
		total += item.amount;
	});

	if (period.weeks === 1 && loans)
	{
		loans.forEach((item) =>
		{
			total += item.weeklyRepaymentAmount;
		});
	}

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