import { useState } from "react";
import ExpenseItem from "./ExpenseItem";

type ExpenseProps = { item: ExpenseItem, onChange?: () => void, onRemove?: (toRemove: ExpenseItem) => void };

const ExpenseComponent = ({item, onChange, onRemove} : ExpenseProps) =>
{
	const [strAmount, setAmount] = useState(item.amount.toString());

	const parseAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setAmount(s);
		item.amount = val;

		if (onChange)
		{
			onChange();
		}
	};

	const updateDescription = (s: string) =>
	{
		item.description = s;

		if (onChange)
		{
			onChange();
		}
	};

	return (
		<div>
			{
				onChange
				? <>
					<input className="input-text" value={item.description} onChange={(evt) => updateDescription(evt.target.value)}/>
					<span className="expense-dollar">$</span>
					<input className="input-number right-margin" value={strAmount} 
						onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
						onChange={(evt) => parseAmount(evt.target.value)}/>
				</>
				: <>
					<input className="input-text" disabled={true} value={item.description}/>
					<span className="expense-dollar">$</span>
					<input className="input-number right-margin" disabled={true} value={item.amount}/>
				</>
			}
			{
				onRemove
				? <button className="btn btn-red" title="Remove" onClick={() => onRemove(item)}>-</button>
				: null
			}
		</div>
	);
};

export default ExpenseComponent;