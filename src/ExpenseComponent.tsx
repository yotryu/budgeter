import { useState } from "react";
import ExpenseItem from "./ExpenseItem";

type ExpenseProps = { item: ExpenseItem, onChange: () => void, onRemove: (toRemove: ExpenseItem) => void };

const ExpenseComponent = ({item, onChange, onRemove} : ExpenseProps) =>
{
	const [strAmount, setAmount] = useState(item.amount.toString());

	const parseAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setAmount(s);
		item.amount = val;

		onChange();
	};

	const updateDescription = (s: string) =>
	{
		item.description = s;
		onChange();
	};

	return (
		<div>
			<input className="input-text" value={item.description} onChange={(evt) => updateDescription(evt.target.value)}/>
			<span className="expense-dollar">$</span>
			<input className="input-number right-margin" value={strAmount} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseAmount(evt.target.value)}/>
			<button className="btn btn-red" onClick={() => onRemove(item)}>-</button>
		</div>
	);
};

export default ExpenseComponent;