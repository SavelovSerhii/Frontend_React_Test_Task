import './App.css';
import React, { useState } from 'react';

type CellId = string;
type CellValue = number;

type Cell = {
  id: CellId,
  amount: CellValue
}

const App: React.FC = () => {
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);
  const [highlightedCellsAmount, setHighlightedCellsAmount] = useState(0);
  const [matrix, setMatrix] = useState<Cell[][]>([]);
  const [rowWithPercent, setRowWithPercent] = useState<number | undefined>(undefined);
  const [foundedIds, setFoundedIds] = useState<string[]>([])

  const handleGenerate = () => {
    const newMatrix: Cell[][] = [];

    for (let rowId = 0; rowId < rows; rowId++) {
      newMatrix[rowId] = [];

      for (let columnId = 0; columnId < columns; columnId++) {
        newMatrix[rowId][columnId] = {
          id: Date.now().toString(36) + Math.random().toString(36),
          amount: 0
        };
      }
    }

    setMatrix([...newMatrix]);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    handleGenerate();
  }
  
  const handleIncreaseAmount = (rowId, columnId) => {
    const newMatrix: Cell[][] = [...matrix];

    newMatrix[rowId][columnId]["amount"]++;

    setMatrix([...newMatrix]);
  }

  const handleRemoveRow = (rowId) => {
    const newMatrix: Cell[][] = [...matrix];

    newMatrix.splice(rowId, 1);

    setMatrix([...newMatrix]);
  }

  const handleAddRow = () => {
    const newMatrix: Cell[][] = [...matrix];
    const newRow: Cell[] = [];

    for (let i = 0; i < matrix[0].length; i++) {
      newRow.push({id: Date.now().toString(36) + Math.random().toString(36), amount: 0});
    }

    newMatrix.push(newRow);

    setMatrix([...newMatrix]);
  }

  const handleSearch = (amount) => {
    let newMatrix: Cell[] = [...matrix].flat();

    newMatrix.sort((a: Cell, b: Cell) => {
      return Math.abs(amount - a.amount) - Math.abs(amount - b.amount);
    })

    setFoundedIds(newMatrix.splice(0, highlightedCellsAmount + (
      newMatrix[1].amount !== newMatrix[2].amount
      || newMatrix[2].amount !== newMatrix[3].amount
        ? 1
        : 0
    )).map(cell => cell.id));
  }

  return (
    <div className="App">
      <form onSubmit={event => handleSubmit(event)}>
        <label>
          Number of columns:
          {columns}

          <br />

          <input
            type="number"
            min={0}
            max={100}
            onChange={event =>
              {
                if (+event.target.value < 0) {
                  event.target.value = '0';
                  setColumns(0);
                } else if (+event.target.value > 100) {
                  event.target.value = '100';
                  setColumns(100);
                } else {
                  setColumns(+event.target.value);
                }
              }
            }
          />
        </label>

        <br />

        <label>
          Number of rows:
          {rows}

          <br />

          <input
            type="number"
            min={0}
            max={100}
            onChange={event =>
              {
                if (+event.target.value < 0) {
                  event.target.value = '0';
                  setRows(0);
                } else if (+event.target.value > 100) {
                  event.target.value = '100';
                  setRows(100);
                } else {
                  setRows(+event.target.value);
                }
              }
            }
          />
        </label>

        <br />

        <label>
          Number of highlighted cells:
          {highlightedCellsAmount}

          <br />

          <input
            type="number"
            min={0}
            max={columns * rows - 1}
            onChange={event =>
              {
                if (+event.target.value < 0) {
                  event.target.value = '0';
                  setHighlightedCellsAmount(0);
                } else if (+event.target.value > columns * rows - 1) {
                  event.target.value = `${columns * rows - 1}`;
                  setHighlightedCellsAmount(columns * rows - 1);
                } else {
                  setHighlightedCellsAmount(+event.target.value);
                }
              }
            }
          />
        </label>

        <br />

        <button type="submit">
          Create New Table
        </button>
      </form>

      <ul className='table'>
        <li className='row'>
          <div className='cell'>
          </div>

          {matrix[0] && matrix[0].map((column, columnId) => (
              <div className='cell' key={columnId}>
                Column {columnId + 1}
              </div>
            ))
          }

          <div className='cell'>
            Sum values
          </div>
        </li>

        {matrix.map((row, rowId) => (
          <li className='row' key={rowId}>
            <div className='cell'>
              Row {rowId + 1}
            </div>

            {matrix[rowId].map((column, columnId) => (
              <button
                className={`cell cell--button ${foundedIds.includes(column.id) ? 'cell--highlighted' : ''}`}
                onClick={() => {handleIncreaseAmount(rowId, columnId); handleSearch(column.amount)}}
                key={columnId}
                onMouseEnter={() => handleSearch(column.amount)}
                onMouseLeave={() => setFoundedIds([])}
              >
                <div className={'percent'} style={{
                  width: rowWithPercent !== rowId
                    ? '0%'
                    : rowWithPercent === rowId
                      ? Math.round(column.amount / matrix[rowId].reduce((prev, current) => prev + current.amount, 0) * 100) + '%'
                      : '0%'
                }}>
                </div>

                {rowWithPercent !== rowId
                  ? column.amount
                  : rowWithPercent === rowId
                    && Math.round(column.amount / matrix[rowId].reduce((prev, current) => prev + current.amount, 0) * 100) + '%'
                }
              </button>
            ))}

            <div
              className='cell'
              onMouseEnter={() => setRowWithPercent(rowId)}
              onMouseLeave={() => setRowWithPercent(undefined)}
            >
              {matrix[rowId].reduce((prev, current) => prev + current.amount, 0)}
            </div>

            <button className='cell cell--button' onClick={() => handleRemoveRow(rowId)}>Remove Row</button>
          </li>
        ))}

        <li className='row'>
          <div className='cell'>
            Average values
          </div>

          {matrix[0] && matrix[0].map((column, columnId) => (
            <div className='cell' key={columnId}>
              {matrix.reduce((prev, current) => prev + current[columnId].amount, 0) / matrix.length}
            </div>
            ))
          }

          <div className='cell'>
          </div>
        </li>

        <li className='row'>
          <button
            className='cell cell--button cell--wide'
            onClick={() => handleAddRow()}
            disabled={matrix.length === 100}
          >
            Add a New Row
          </button>
        </li>
      </ul>
    </div>
  );
}

export default App;
