import { useState } from "react";
import LoanItem from "./LoanItem";

type LoanProps = { item: LoanItem, getYearlyTotal: () => number, onChange: () => void, onRemove: (toRemove: LoanItem) => void };

const LoanComponent = ({item, getYearlyTotal, onChange, onRemove} : LoanProps) =>
{
	const [strAmount, setAmount] = useState(item.amount.toString());
	const [strRate, setRate] = useState(item.interestRate.toString());
	const [strTerm, setTerm] = useState(item.termYears.toString());
	const [strRepay, setRepay] = useState(item.weeklyRepaymentAmount.toString());

	const parseAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setAmount(s);
		item.amount = val;

		onChange();
	};

	const parseRate = (s: string) =>
	{
		const val = parseFloat(s);
		setRate(s);
		item.interestRate = val;

		onChange();
	};

	const parseTerm = (s: string) =>
	{
		const val = parseFloat(s);
		setTerm(s);
		item.termYears = val;

		onChange();
	};

	const parseRepaymentAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setRepay(s);
		item.weeklyRepaymentAmount = val;

		onChange();
	};

	const updateDescription = (s: string) =>
	{
		item.description = s;
		onChange();
	};

	const monthlyStats = [];
	let monthsRemaining = item.termYears * 12;
	let amountRemaining = item.amount;
	const weeksPerMonth = 52 / 12;
	const daysPerMonth = 365 / 12;
	const interestRatePerDay = item.interestRate / 100 / 365;
	const monthRepayments = item.weeklyRepaymentAmount * weeksPerMonth;
	const monthlySavings = getYearlyTotal() / 12;
	let offsetAmount = 130000;

	for (let i = Math.floor(monthsRemaining); i > 0 && amountRemaining > 0; --i)
	{
		const prevAmount = amountRemaining;
		const amountChargedInterest = Math.max(amountRemaining - offsetAmount, 0);

		const monthInterest = (amountChargedInterest * Math.pow(1 + interestRatePerDay, daysPerMonth)) - amountChargedInterest;

		amountRemaining = amountRemaining + monthInterest - monthRepayments;
		offsetAmount += monthlySavings;

		const monthPrincipal = prevAmount - amountRemaining;

		monthlyStats.push({ interest: monthInterest, principal: monthPrincipal, repayments: monthRepayments, remaining: amountRemaining });
	}
	
	return (
		<div>
			<input className="input-text input-150" value={item.description} onChange={(evt) => updateDescription(evt.target.value)}/>
			<span className="expense-dollar">$</span>
			<input className="input-number input-80" value={strAmount} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseAmount(evt.target.value)}/>
			<span>@</span>
			<input className="input-number input-50" value={strRate} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseRate(evt.target.value)}/>
			<span>% over</span>
			<input className="input-number input-50" value={strTerm} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseTerm(evt.target.value)}/>
			<span className="right-margin">years</span>
			<button className="btn btn-red" onClick={() => onRemove(item)}>-</button>
			<div>
				<span>Weekly repayments of $</span>
				<input className="input-number input-50" value={strRepay} 
					onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
					onChange={(evt) => parseRepaymentAmount(evt.target.value)}/>
			</div>
			<div>
				<span>Monthly repayments of ${monthRepayments.toFixed(2)} paid off in {(monthlyStats.length / 12).toFixed(1)} years</span>
			</div>
			{
				monthlyStats.map((item, index) =>
				{
					return (
						<div key={index}>
							{`(${index}) int. $${item.interest.toFixed(2)} (${(item.interest / monthRepayments * 100).toFixed(2)}%) / prin. $${item.principal.toFixed(2)} (${(item.principal / monthRepayments * 100).toFixed(2)}%) = $${item.remaining.toFixed(2)} remaining`}
						</div>
					);
				})
			}
		</div>
	);
};

export default LoanComponent;