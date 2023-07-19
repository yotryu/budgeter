interface LoanItem
{
	description: string,
	amount: number,
	termYears: number,
	interestRate: number,
	weeklyRepaymentAmount: number,
	offsetStart: number,
	savingsToOffsetPercent: number
};

export default LoanItem;