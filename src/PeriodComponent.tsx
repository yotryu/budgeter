import ExpenseComponent from "./ExpenseComponent";
import ExpenseItem from "./ExpenseItem";
import IncomeComponent from "./IncomeComponent";
import { IncomeItem } from "./IncomeItem";
import LoanItem from "./LoanItem";
import {PeriodItem, getPeriodExpensesTotal, getPeriodIncomeTotal} from "./PeriodItem";

type PeriodProps = { item: PeriodItem, loans: LoanItem[], onChange: () => void, getYearlyTotal: () => number };

const PeriodComponent = ({item, loans, onChange, getYearlyTotal} : PeriodProps) =>
{
	const addExpense = () =>
	{
		const newItem = {description: "description", amount: 0};
		item.expenses.push(newItem);
		onChange();
	};

	const addIncome = () =>
	{
		const newItem = {description: "description", amount: 0};
		item.income.push(newItem);
		onChange();
	};

	const removeExpense = (toRemove: ExpenseItem) =>
	{
		item.expenses = item.expenses.filter(e => e !== toRemove);
		onChange();
	};

	const removeIncome = (toRemove: IncomeItem) =>
	{
		item.income = item.income.filter(e => e !== toRemove);
		onChange();
	};

	const numberFormat = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
	const expenseTotal = getPeriodExpensesTotal(item, loans);
	const incomeTotal = getPeriodIncomeTotal(item);
	const yearlyTotal = getYearlyTotal() / 52 * item.weeks;
	const totalClassName = "expense-total " + (yearlyTotal >= 0 ? "expense-total-positive" : "expense-total-negative");

	return (
		<div>
			<h3 className="inline-header no-bottom-margin">{item.name}</h3>
			<div>
				<span className="inline-block align-top expenses-group">
					<p className="inline-header"><b>Expenses</b></p>
					<button className="btn" title="Add" onClick={() => addExpense()}>+</button>
					{
						item.expenses.map((expense, index) =>
						{
							return <ExpenseComponent key={index} item={expense} onChange={onChange} onRemove={removeExpense}/>
						})
					}
					{
						item.weeks === 1 && loans
						? loans.map((loan, index) =>
						{
							const expense = {description: loan.description, amount: loan.weeklyRepaymentAmount};
							return <ExpenseComponent key={`loan ${index}`} item={expense}/>
						})
						: null
					}
					{
						expenseTotal !== 0
						? <div className="expense-total-container">
							<span className="expense-dollar">$</span>
							<span className="expense-sub-total">{expenseTotal.toLocaleString(undefined, numberFormat)}</span>
						</div>
						: null
					}
				</span>
				<span className="inline-block align-top expenses-group">
					<p className="inline-header"><b>Income</b></p>
					<button className="btn" title="Add" onClick={() => addIncome()}>+</button>
					{
						item.income.map((income, index) =>
						{
							return <IncomeComponent key={index} item={income} onChange={onChange} onRemove={removeIncome}/>
						})
					}
					{
						incomeTotal !== 0
						? <div className="expense-total-container">
							<span className="expense-dollar">$</span>
							<span className="income-sub-total">{incomeTotal.toLocaleString(undefined, numberFormat)}</span>
						</div>
						: null
					}
				</span>
				<div className="expense-total-container">
					<span className="expense-dollar">$</span>
					<span className={totalClassName}>{yearlyTotal.toLocaleString(undefined, numberFormat)}</span>
				</div>
			</div>
		</div>
	);
};

export default PeriodComponent;