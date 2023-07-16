import { useState } from "react";
import {IncomeItem} from "./IncomeItem";

type IncomeProps = { item: IncomeItem, onChange: () => void, onRemove: (toRemove: IncomeItem) => void };

const IncomeComponent = ({item, onChange, onRemove} : IncomeProps) =>
{
	const [strAmount, setAmount] = useState(item.amount.toString());
	const [isValidAmount, setIsValidAmount] = useState(true);

	const parseAmount = (s: string) =>
	{
		const val = parseFloat(s);
		setIsValidAmount(isNaN(val) === false);
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
			<input className="input-number" value={strAmount} 
				onFocus={(evt) => evt.target.setSelectionRange(0, evt.target.value.length)} 
				onChange={(evt) => parseAmount(evt.target.value)}/>
			{
				isValidAmount
				? null
				: "Invalid amount"
			}
			<button className="btn btn-red" onClick={() => onRemove(item)}>-</button>
		</div>
	);
};

export default IncomeComponent;