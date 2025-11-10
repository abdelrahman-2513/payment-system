import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { ERoles } from "../../shared/enums/role.enum";
import * as bcrypt from "bcryptjs";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ 
        type: 'enum', 
        enum: ERoles, 
        default: ERoles.USER 
    })
    role: ERoles;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // This Function is used to encrypt the password before the saving of it
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            const genSalt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, genSalt);
        }
    }
}