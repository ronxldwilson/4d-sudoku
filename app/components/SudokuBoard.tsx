// app/components/SudokuBoard.tsx

'use client';

import React from "react";

type SudokuBoardProps = {
  board: string[][];
  onChange: (row: number, col: number, val: string) => void;
  isPrefilled: (row: number, col: number) => boolean;
  isValid: (row: number, col: number, val: string) => boolean;
  layer: number;
  selectedCell: { layer: number; row: number; col: number } | null;
  setSelectedCell: (row: number, col: number) => void;
};

export default function SudokuBoard({
  board,
  onChange,
  isPrefilled,
  isValid,
  layer,
  selectedCell,
  setSelectedCell
}: SudokuBoardProps) {

  const getNumberCounts = () => {
    const counts: Record<string, number> = {};
    for (let num = 1; num <= 9; num++) {
      counts[num.toString()] = 0;
    }

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const val = board[row][col];
        if (/^[1-9]$/.test(val)) {
          counts[val]++;
        }
      }
    }

    return counts;
  };

  return (
    <>
      <div className="grid grid-rows-9 gap-1">

        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((value, colIndex) => {
              const valid = isValid(rowIndex, colIndex, value);

              const isSelected =
                selectedCell &&
                selectedCell.layer === layer &&
                selectedCell.row === rowIndex &&
                selectedCell.col === colIndex;

              const isSameRow = selectedCell && selectedCell.layer === layer && selectedCell.row === rowIndex;
              const isSameCol = selectedCell && selectedCell.layer === layer && selectedCell.col === colIndex;
              const isSameValue =
                selectedCell &&
                board[selectedCell.row][selectedCell.col] !== '' &&
                value === board[selectedCell.row][selectedCell.col] &&
                selectedCell.layer === layer &&
                !(selectedCell.row === rowIndex && selectedCell.col === colIndex);

              const isSameBox =
                selectedCell &&
                selectedCell.layer === layer &&
                Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3);

              const isSameCell3D =
                selectedCell &&
                selectedCell.row === rowIndex &&
                selectedCell.col === colIndex &&
                selectedCell.layer !== layer;

              const highlight =
                isSelected
                  ? 'bg-yellow-300'
                  : isSameRow || isSameCol || isSameBox
                    ? 'bg-blue-900'
                    : isSameCell3D
                      ? 'bg-green-900'
                      : isSameValue
                        ? 'bg-purple-400'
                        : '';


              return (


                <input
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-10 h-10 text-center text-black text-lg font-semibold focus:outline-none border
                     
                  ${rowIndex % 3 === 0 ? 'border-t-4' : 'border-t'}
                  ${colIndex % 3 === 0 ? 'border-l-4' : 'border-l'}
                  ${rowIndex === 8 ? 'border-b-4' : ''}
                  ${colIndex === 8 ? 'border-r-4' : ''}

                  ${isSelected ? '' : isPrefilled(rowIndex, colIndex) ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'}
                  ${!valid && !isPrefilled(rowIndex, colIndex) ? 'border-red-500' : 'border-gray-500'}
                  ${highlight}
                `}
                  maxLength={1}
                  value={value}
                  readOnly={isPrefilled(rowIndex, colIndex)}
                  onChange={(e) => onChange(rowIndex, colIndex, e.target.value)}
                  onFocus={() => setSelectedCell(rowIndex, colIndex)}
                />

              );
            })}
          </div>

        ))}
      </div>

      <div className="mt-2 grid grid-cols-9 gap-1 text-xs text-center text-black font-medium">
        {Object.entries(getNumberCounts()).map(([num, count]) => (
          <div key={num} className="p-1 border border-gray-300 rounded bg-gray-100">
            <div className="text-blue-500 text-lg">
              {num}
            </div>
            <div>
              {9 - count}

            </div>
          </div>
        ))}
      </div>

    </>
  );
}
