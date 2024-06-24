import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class WorkInfo {

    //工作Id
    @PrimaryGeneratedColumn()
    workId: number;

    //用户Id
    @Column({ type: "int" })
    workUserId: number;

    //使用的自然语言
    @Column({ type: "varchar" })
    workText: string;

    //使用的API
    @Column({ type: "varchar" })
    workApi: string;

    //工作状态(processing, completed, failed)
    @Column({ type: "varchar" })
    workStatus: string;

    //工作启动时间
    @CreateDateColumn({ type: "timestamp" })
    workStartTime: Date;

    //工作耗时(秒)
    @Column({ type: "int" })
    workUseTime: number;

    //工作消耗的绘点
    @Column({ type: "int" })
    workUsePoints: number;

    //工作结果(链接)
    @Column({ type: "varchar" })
    workResult: string;

}