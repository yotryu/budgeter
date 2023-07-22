import { useState } from 'react';
import './App.css';
import PeriodComponent from './PeriodComponent';
import { getPeriodExpensesTotal, getPeriodIncomeTotal } from './PeriodItem';
import LoansComponent from './LoansComponent';

const sampleData = {
	periods: [
		{ name: "Weekly", weeks: 1, expenses: [], income: [] },
		{ name: "Fortnightly", weeks: 2, expenses: [], income: [] },
		{ name: "Monthly", weeks: 52/12, expenses: [], income: [] },
		{ name: "Quarterly", weeks: 13, expenses: [], income: [] },
		{ name: "Yearly", weeks: 52, expenses: [], income: [] },
	],
	loans: []
};

function App()
{
	const [container, setContainer] = useState(sampleData);
	const [containerGuid, setContainerGuid] = useState(crypto.randomUUID());
	const [filename, setFilename] = useState("");

	const openFile = () =>
	{
		const fileInput = document.createElement("input");
		fileInput.type = 'file';
		fileInput.style.display = 'none';
		fileInput.onchange = (e) => 
		{
			const target = e.target as HTMLInputElement;
			const file = target && target.files && target.files.length > 0 ? target.files[0] : null;
			if (!file)
			{
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) =>
			{
				const contents = e.target ? e.target.result : null;
				if (contents)
				{
					const newData = JSON.parse(contents.toString());
					setContainer({...sampleData, ...newData});
					setContainerGuid(crypto.randomUUID());

					const extStartIndex = file.name.lastIndexOf('.');
					const fname = extStartIndex >= 0 ? file.name.substring(0, extStartIndex) : file.name;
					setFilename(fname);
				}
				
				document.body.removeChild(fileInput);
			};

			reader.readAsText(file);
		};

		document.body.appendChild(fileInput);
		fileInput.click();
	};

	const saveFile = (data: string) =>
	{
		const fname = filename ? (filename.endsWith(".json") ? filename : filename + ".json") : "budgeter.json";
		const tempLink = document.createElement("a");
		const blob = new Blob([data], {type: 'application/json'});
		tempLink.setAttribute('href', URL.createObjectURL(blob));
		tempLink.setAttribute('download', fname);
		tempLink.click();
		
		URL.revokeObjectURL(tempLink.href);
	};

	const getYearyTotal = (): number =>
	{
		let total = 0;
		container.periods.forEach((item) =>
		{
			total -= getPeriodExpensesTotal(item) / item.weeks * 52;
			total += getPeriodIncomeTotal(item) / item.weeks * 52;
		});

		return total;
	};

	const getYearlyIncomeTotal = (): number =>
	{
		let total = 0;
		container.periods.forEach((item) =>
		{
			total += getPeriodIncomeTotal(item) / item.weeks * 52;
		});

		return total;
	};

	const expenseIncomeRatio = getYearyTotal() / getYearlyIncomeTotal();

	return (
		<div key={containerGuid}>
			<div>
				<button className='btn btn-grey inline-header' onClick={openFile}>Open...</button>
				<input className='input-text' value={filename} onChange={(e) => setFilename(e.target.value)}/>
				<button className='btn btn-grey' onClick={() => saveFile(JSON.stringify(container))}>Save...</button>
			</div>
			<span className='expenses'>
				<h2 className='inline-header no-bottom-margin'>Expenses / Income</h2>
				<span className='inline-header'>{(expenseIncomeRatio * 100).toFixed(0)}%</span>
				{
					container.periods.map((item, index) =>
					{
						return (<PeriodComponent key={index} item={item}
							getYearlyTotal={getYearyTotal}
							onChange={() => setContainer({...container})}/>);
					})
				}
			</span>
			<span className='loans'>
				<h2 className='inline-header no-bottom-margin'>Loans</h2>
				<LoansComponent items={container.loans} onChange={() => setContainer({...container})} getYearlyTotal={getYearyTotal}/>
			</span>
		</div>
	);
}

export default App;
