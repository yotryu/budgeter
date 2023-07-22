import { useState } from "react";
import { Line } from "react-chartjs-2";
import LoanItem from "./LoanItem";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Colors
} from 'chart.js';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Colors
  );

type LoanProps = { item: LoanItem, getYearlyTotal: () => number, onChange: () => void, onRemove: (toRemove: LoanItem) => void };

const LoanComponent = ({item, getYearlyTotal, onChange, onRemove} : LoanProps) =>
{
	const weeksPerMonth = 52 / 12;
	const daysPerMonth = 365 / 12;
	const interestRatePerDay = item.interestRate / 100 / 365;
	const monthRepayments = item.weeklyRepaymentAmount * weeksPerMonth;
	const monthlySavings = getYearlyTotal() / 12;
	const weeklySavings = getYearlyTotal() / 52;

	const [strAmount, setAmount] = useState(item.amount.toString());
	const [strRate, setRate] = useState(item.interestRate.toString());
	const [strTerm, setTerm] = useState(item.termYears.toString());
	const [strRepay, setRepay] = useState(item.weeklyRepaymentAmount.toString());
	const [strOffsetStart, setOffsetStart] = useState(item.offsetStart ? item.offsetStart.toString() : "0");
	const [strSavingsToOffset, setSavingsToOffset] = useState(item.savingsToOffsetPercent ? (item.savingsToOffsetPercent * 100).toString() : "0");
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const updateRepayments = () =>
	{
		const ratePerMonth = item.interestRate / 100 / 12;
		const monthsInLoan = item.termYears * 12;

		const repaymentAmountPerMonth = (ratePerMonth * item.amount) / (1 - Math.pow(1 + ratePerMonth, -monthsInLoan));
		const repaymentAmountPerWeek = Math.ceil(repaymentAmountPerMonth * 12 / 52) + 1;

		parseRepaymentAmount(repaymentAmountPerWeek.toString());
	}

	const parseAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setAmount(s);
		item.amount = val;

		updateRepayments();

		onChange();
	};

	const parseRate = (s: string) =>
	{
		const val = parseFloat(s);
		setRate(s);
		item.interestRate = val;

		updateRepayments();

		onChange();
	};

	const parseTerm = (s: string) =>
	{
		const val = parseFloat(s);
		setTerm(s);
		item.termYears = val;

		updateRepayments();

		onChange();
	};

	const parseRepaymentAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setRepay(s);
		item.weeklyRepaymentAmount = val;

		onChange();
	};

	const parseOffsetStartAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setOffsetStart(s);
		item.offsetStart = val;

		onChange();
	};

	const parseSavingsToOffsetPercent = (s: string) =>
	{
		const val = parseFloat(s);
		setSavingsToOffset(s);

		if (isNaN(val) === false)
		{
			item.savingsToOffsetPercent = val / 100;
		}
		else
		{
			item.savingsToOffsetPercent = 0;
		}

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
	let offsetAmount = item.offsetStart;
	let totalInterest = 0;
	let totalPrincipal = 0;
	let totalRepayments = 0;

	monthlyStats.push({
		interest: 0,
		principal: 0,
		repayments: 0,
		remaining: amountRemaining,
		offsetAmount: offsetAmount,
		totalInterest: 0,
		totalPrincipal: 0,
		totalRepayments: 0
	});

	for (let i = Math.floor(monthsRemaining); i > 0 && amountRemaining > 0; --i)
	{
		const prevAmount = amountRemaining;
		const interestOffsetAmount = offsetAmount;
		const amountChargedInterest = Math.max(amountRemaining - offsetAmount, 0);

		const monthInterest = parseFloat(((amountChargedInterest * Math.pow(1 + interestRatePerDay, daysPerMonth)) - amountChargedInterest).toFixed(2));

		amountRemaining = amountRemaining + monthInterest - monthRepayments;
		offsetAmount += monthlySavings * item.savingsToOffsetPercent;

		const monthPrincipal = prevAmount - amountRemaining;

		totalInterest += monthInterest;
		totalPrincipal += monthPrincipal;
		totalRepayments += monthRepayments;

		monthlyStats.push({
			interest: monthInterest,
			principal: monthPrincipal,
			repayments: monthRepayments, 
			remaining: Math.max(0, amountRemaining),
			offsetAmount: interestOffsetAmount,
			totalInterest: totalInterest,
			totalPrincipal: totalPrincipal,
			totalRepayments: totalRepayments
		});
	}

	const yearlyStats = monthlyStats.filter((item, index) => index % 12 === 0 || index === monthlyStats.length - 1);

	const chartData = {
		labels: yearlyStats.map((item, index) => index),
		datasets: [
			{
				id: 1,
				label: "Principal",
				data: yearlyStats.map(item => item.remaining)
			},
			{
				id: 2,
				label: "Offset",
				data: yearlyStats.map(item => item.offsetAmount)
			}
		]
	};

	const chartOptions = {
		scales: {
			x: {
				title: {
					display: true,
					text: "Year"
				}
			},
			y: {
				title: {
					display: true,
					text: "$"
				}
			}
		},
		interaction: {
			mode: "x" as const
		},
		plugins: {
			tooltip: {
				callbacks: {
					afterLabel: (context: any) =>
					{
						const thisData = yearlyStats[context.dataIndex];
						if (thisData.totalRepayments === 0)
						{
							return "";
						}

						if (context.datasetIndex === 0)
						{
							return `Total interest: ${thisData.totalInterest.toLocaleString()} (${(thisData.totalInterest / thisData.totalRepayments * 100).toFixed(2)}%)\n`
								+ `Total repayments: ${thisData.totalRepayments.toLocaleString()}`;
						}
						else
						{
							return `Interest reduction: ${(Math.min(thisData.offsetAmount / thisData.remaining, 1) * 100).toFixed(2)}%`;
						}
					}
				}
			}
		},
		onClick: (evt: any, elements: any, chart: any) =>
		{
			const els = chart.getElementsAtEventForMode(evt, "nearest" as const, { intersect: false }, true);
			if (els && els.length > 0)
			{
				setSelectedIndex(els[0].index);
			}
		}
	};

	const selectedContent = () =>
	{
		if (selectedIndex <= 0 || selectedIndex >= yearlyStats.length)
		{
			return null;
		}

		const data = yearlyStats[selectedIndex];
		const principalText = `-$${data.totalPrincipal.toLocaleString()} / $${data.remaining.toLocaleString()} (${(data.remaining / item.amount * 100).toFixed(2)}%)`;
		const interestText = `$${data.totalInterest.toLocaleString()} (${(data.totalInterest / data.totalRepayments * 100).toFixed(2)}%)`;
		const repaymentsText = `$${data.totalRepayments.toLocaleString()}`;
		const offsetText = `$${data.offsetAmount.toLocaleString()} (${(data.offsetAmount / data.remaining * 100).toFixed(2)}%)`;

		return (
			<div>
				<div className="small-bottom-margin">After {selectedIndex} {selectedIndex > 1 ? "years" : "year"}</div>
				<div className="row small-bottom-margin">
					<span>Total repayments made:</span><span className="float-right">{repaymentsText}</span>
				</div>
				<div className="row small-bottom-margin">
					<span>Principal:</span><span className="float-right">{principalText}</span>
				</div>
				<div className="row small-bottom-margin">
					<span>Total interest paid:</span><span className="float-right">{interestText}</span>
				</div>
				<div className="row small-bottom-margin">
					<span>Offset available:</span><span className="float-right">{offsetText}</span>
				</div>
			</div>
		);
	};
	
	return (
		<div className="loans-item inline-block">
			<div>
			<button className="btn btn-red float-right" title="Remove" onClick={() => onRemove(item)}>X</button>
			<input className="input-text input-150" value={item.description} onChange={(evt) => updateDescription(evt.target.value)}/>
			<span className="expense-dollar">$</span>
			<input className="input-number input-80" value={strAmount} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseAmount(evt.target.value)}/>
			</div>
			<div>
			<span>@</span>
			<input className="input-number input-50" value={strRate} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseRate(evt.target.value)}/>
			<span>% over</span>
			<input className="input-number input-50" value={strTerm} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseTerm(evt.target.value)}/>
			<span className="right-margin">years</span>
			</div>
			<div className="loan-line">
				<span>Weekly repayments</span>
				<span className="loan-right">
					<span>$</span>
					<input className="input-number input-80" value={strRepay} 
						onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
						onChange={(evt) => parseRepaymentAmount(evt.target.value)}/>
				</span>
			</div>
			<div className="loan-line">
				<span>Offset start</span>
				<span className="loan-right">
					<span>$</span>
					<input className="input-number input-80" value={strOffsetStart} 
						onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
						onChange={(evt) => parseOffsetStartAmount(evt.target.value)}/>
				</span>
			</div>
			<div className="loan-line">
				<span>Saving rate</span>
				<span className="loan-right">
					<input className="input-number input-50" value={strSavingsToOffset} 
						onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
						onChange={(evt) => parseSavingsToOffsetPercent(evt.target.value)}/>
					<span>% = ${item.savingsToOffsetPercent ? (item.savingsToOffsetPercent * weeklySavings).toFixed(2) : "0.00"} / week</span>
				</span>
			</div>
			<div className="loans-summary small-top-margin">
				<span>Monthly repayments of ${monthRepayments.toFixed(2)} paid off in {((monthlyStats.length - 1) / 12).toFixed(1)} years</span>
			</div>
			<Line datasetIdKey="id" data={chartData} options={chartOptions}/>
			{selectedContent()}
		</div>
	);
};

export default LoanComponent;