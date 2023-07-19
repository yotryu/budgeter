import LoanComponent from "./LoanComponent";
import LoanItem from "./LoanItem";

type LoansProps = { items: LoanItem[], onChange: () => void, getYearlyTotal: () => number };

const LoansComponent = ({items, onChange, getYearlyTotal} : LoansProps) =>
{
	const addLoan = () =>
	{
		const newItem = {description: "description", amount: 0, termYears: 0, interestRate: 0, weeklyRepaymentAmount: 0, offsetStart: 0, savingsToOffsetPercent: 0};
		items.push(newItem);
		onChange();
	};

	const removeLoan = (toRemove: LoanItem) =>
	{
		const remIndex = items.findIndex(e => e === toRemove);
		items.splice(remIndex, 1);
		onChange();
	};

	return (
		<>
			<button className="btn" onClick={() => addLoan()}>+</button>
			<div className="expenses-group">
			{
				items.map((loan, index) =>
				{
					return <LoanComponent key={index} item={loan} onChange={onChange} onRemove={removeLoan} getYearlyTotal={getYearlyTotal}/>
				})
			}
			</div>
		</>
	);
};

export default LoansComponent;