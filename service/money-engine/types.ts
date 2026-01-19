export interface DefinitionResponseDto {
    name: string;
    description: string;
    visualType: string;
}

export interface UserVoucherResponseDto {
    id: string;
    totalBalance: number;
    state: string;
    definition: DefinitionResponseDto;
}

export interface TransferDto {
    fromVoucherId: string;
    toVoucherId: string;
    amount: number;
}

export interface CashbackDto {
    userVoucherId: string;
    amount: number;
    shopId: string;
}
