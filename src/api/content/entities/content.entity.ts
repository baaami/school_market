import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Users } from "src/api/user/entities/user.entity";
import { Images } from "src/common/entities/image.entity";
import { Reviews } from "src/common/entities/review.entity";
import { Favorites } from "src/common/entities/favorite.entity";

@Entity({ schema: "school", name: "contents" })
export class Contents {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "title", length: 100 })
  title: string;

  @Column("varchar", { name: "body", length: 2000 })
  body: string;
  
  @Column("varchar", { name: "category", length: 100 })
  category: string;

  @Column("boolean", { name: "completed" })
  completed: boolean;

  @Column("varchar", { name: "latitude", length: 50 })
  latitude: string;

  @Column("varchar", { name: "longitude", length: 50 })
  longitude: string;

  @Column("varchar", { name: "location", length: 100 })
  location: string;
  
  @Column("int", { name: "price" })
  price: number;

  @Column("int", { name: "like_cnt" })
  like_cnt: number;

  @Column("int", { name: "chat_cnt" })
  chat_cnt: number;

  @UpdateDateColumn()
  completed_date: Date;

  @ManyToOne(() => Users, buyer => buyer.id)
  @JoinColumn({ name: "buyer_id" })
  buyer: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Users, user => user.id)
  @JoinColumn([{ name: "owner_id" }])
  owner: Users;

  @ManyToMany(() => Favorites, (favorite) => favorite.id)
  favorites: Favorites[];

  @OneToMany(() => Images, (images) => images.id)
  image: Images;
}
