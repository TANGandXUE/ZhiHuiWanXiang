import { Entity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Pay {

    //付款者交易订单ID
    @PrimaryColumn()
    payertradeId: string;

    //付款者id
    @Column({ type: "int" })
    payerId: number;

    //付款者付款时间
    @CreateDateColumn({ type: "timestamp" })
    payerpayDate: Date;

    //付款者增加点数
    @Column({ type: "int" })
    payerAddPoints: number;

    //付款者会员延长时间
    @CreateDateColumn({ type: "timestamp" })
    payerAddExpireDate: Date;

    //付款者会员等级增加
    @Column({ type: "int" })
    payerAddLevel: number;

}