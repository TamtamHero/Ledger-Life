pragma solidity ^0.5.0;

contract LedgerLife {
    address[32 * 32] public grid;

    // take ownership of a list of cells
    function buyCells(uint256 cells) public {
        uint8 num_cells = (uint8)(cells & 0x1F);
        require(num_cells > 0 && num_cells < 21);
        cells = cells >> (5 + 11); // 5 bits for num_cells, 11 unused
        for (uint8 index = 0; index < num_cells; index++) {
            uint16 cell_index = (uint16)(cells & 0x0FFF);
            cells = cells >> 12;
            require(cell_index >= 0 && cell_index < (32 * 32));
            require(is_owned(grid[cell_index]) == 0);
            grid[cell_index] = msg.sender;
        }
    }

    function is_owned(address cell) private returns (uint8) {
        if (cell != address(0)) {
            return 1;
        }
        return 0;
    }

    function count_neighbours(uint8 x, uint8 y) private returns (uint8) {
        if (x > 0 && y > 0) {
            return
                is_owned(grid[(y - 1) * 32 + x - 1]) +
                is_owned(grid[(y - 1) * 32 + x]) +
                is_owned(grid[(y - 1) * 32 + x + 1]) +
                is_owned(grid[(y) * 32 + x - 1]) +
                is_owned(grid[(y) * 32 + x + 1]) +
                is_owned(grid[(y + 1) * 32 + x - 1]) +
                is_owned(grid[(y + 1) * 32 + x]) +
                is_owned(grid[(y + 1) * 32 + x + 1]);
        } else if (x == 0 && y > 0) {
            return
                is_owned(grid[(y - 1) * 32 + x]) +
                is_owned(grid[(y - 1) * 32 + x + 1]) +
                is_owned(grid[(y) * 32 + x + 1]) +
                is_owned(grid[(y + 1) * 32 + x]) +
                is_owned(grid[(y + 1) * 32 + x + 1]);
        } else if (x > 0 && y == 0) {
            return
                is_owned(grid[(y) * 32 + x - 1]) +
                is_owned(grid[(y) * 32 + x + 1]) +
                is_owned(grid[(y + 1) * 32 + x - 1]) +
                is_owned(grid[(y + 1) * 32 + x]) +
                is_owned(grid[(y + 1) * 32 + x + 1]);
        } else {
            return
                is_owned(grid[(y) * 32 + x + 1]) +
                is_owned(grid[(y + 1) * 32 + x]) +
                is_owned(grid[(y + 1) * 32 + x + 1]);
        }
    }

    function life() public {
        for (uint16 index = 0; index < grid.length; index++) {
            if (is_owned(grid[index]) != 0) {
                uint8 x = (uint8)(index % 32);
                uint8 y = (uint8)(index / 32);
                uint8 neighbours = count_neighbours(x, y);
                if (neighbours < 2 || neighbours > 3) {
                    grid[index] = address(0);
                }
            }
        }
    }

    function getGrid() public view returns (address[32 * 32] memory) {
        return grid;
    }
}
