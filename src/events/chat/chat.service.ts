import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chats } from "./entities/chat.entity";
import { Rooms } from "./entities/room.entity";
import { CreateRoomDto } from "./dto/create-room.dto";
import { CreateChatDto } from "./dto/create-chat.dto";
import {
  BUYER,
  SELLER,
  UNKNOWN_USER,
  pagenation_chat_size,
} from "src/common/define";
import { RoomService } from "src/api/room/rooms.service";
import { Users } from "src/api/user/entities/user.entity";
import { CreateReviewDto } from "src/api/review/dto/create-review.dto";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Rooms) private RoomRepository: Repository<Rooms>,
    @InjectRepository(Chats) private ChatRepository: Repository<Chats>,
    private readonly roomService: RoomService
  ) {} // @InjectRepository

  /**
   * @brief          전달된 Room의 식별자 전달
   *
   * @param room     찾고자하는 혹은 추가할 Room 인터페이스
   * @returns        찾고자하는 혹은 추가된 Room Id
   */
  async getRoomId(room: CreateRoomDto): Promise<string> {
    let target_room: Rooms;

    try {
      target_room = await this.roomService.findExistRoom(room);
    } catch (err) {
      console.error(err);
    }

    if (target_room == null) {
      target_room = await this.roomService.createRoom(room);
    }

    return String(target_room.id);
  }

  /**
   * @brief     id를 통해 db내 room 데이터 획득
   * @param id  얻고자하는 room 식별자
   * @returns   id를 가지고 있는 room
   */
  async getRoomById(id: number): Promise<Rooms> {
    let target_room: Rooms;

    try {
      target_room = await this.RoomRepository.findOneBy({
        id,
      });
    } catch (err) {
      console.error(err);
    }

    return target_room;
  }

  /**
   * @brief             전달된 User가 참가하여 있는 Room List 전달
   *
   * @param     userId  User 식별자
   * @returns           찾고자하는 Room List
   */
  async getJoinedRoomList(userId: number): Promise<Rooms[]> {
    let room_list: Rooms[] = await this.RoomRepository.find({
      where: [
        {
          buyer_id: userId,
        },
        {
          seller_id: userId,
        },
      ],
    });

    const result_room_list = room_list.filter((target_room: Rooms) => {
      const userType = this.getUserType(target_room, userId);
      if (userType == SELLER) {
        if (target_room.seller_out == false) return true;
      } else if (userType == BUYER) {
        if (target_room.buyer_out == false) return true;
      } else {
        console.error("Unknown User Type");
      }

      return false;
    });

    return result_room_list;
  }

  /**
   * @brief             전달된 User가 참가하여 있는 Room 전달
   *
   * @param     roomId  Room 식별자
   * @returns           찾고자하는 Room List
   */
  async getRoomInfo(roomId: number): Promise<Rooms> {
    const target_room: Rooms = await this.RoomRepository.findOneBy({
      id: roomId,
    });
    return target_room;
  }

  async getChatList(
    page: number = 0,
    roomId: Number
  ): Promise<[Chats[], number]> {
    let res: [Chats[], number];

    try {
      res = await this.ChatRepository.createQueryBuilder("chats")
        .leftJoinAndSelect("chats.room", "room")
        .where("room.id = :roomId", { roomId })
        .orderBy("chats.id", "DESC")
        .skip(
          page * pagenation_chat_size != 0 ? page * pagenation_chat_size : 0
        )
        .take(pagenation_chat_size)
        .getManyAndCount();
    } catch (err) {
      console.error(err);
    }

    return res;
  }

  async getChatLatest(roomId: Number): Promise<Chats> {
    let res: Chats;

    try {
      res = await this.ChatRepository.createQueryBuilder("chats")
        .leftJoinAndSelect("chats.room", "room")
        .where("room.id = :roomId", { roomId })
        .orderBy("chats.createdAt", "DESC")
        .getOne();
    } catch (err) {
      console.error(err);
    }

    return res;
  }

  getChatPartner(userId: string, room: Rooms): number {
    const userType = this.getUserType(room, Number(userId));
    if (userType == SELLER) {
      return room.buyer_id;
    } else if (userType == BUYER) {
      return room.seller_id;
    }
    return UNKNOWN_USER;
  }

  /**
   * @brief         전달된 메시지를 DB에 저장
   * @param room    Room 정보
   * @param msg     송/수신 메시지
   */
  async addMessage(msgPayload: CreateChatDto) {
    try {
      this.ChatRepository.save(msgPayload);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   * @param roomId     room id
   * @param memberType buyer or seller
   */
  async updateConfirmTime(roomId: number, memberType: number) {
    try {
      if (memberType == SELLER) {
        this.RoomRepository.update(
          { id: roomId },
          {
            seller_confirm_time: new Date(),
          }
        );
        console.log('seller confirmTime업데이트')
      } else {
        this.RoomRepository.update(
          { id: roomId },
          {
            buyer_confirm_time: new Date(),
          }
        );
        console.log('buyer confirmTime업데이트')
      }
    } catch (err) {
      console.error(err);
    }
  }

  /**
   *
   * @param userId:
   */
  getUserType(room: Rooms, userId: number): number {
    if (userId == room.buyer_id) {
      return BUYER;
    } else if (userId == room.seller_id) {
      return SELLER;
    }
    return UNKNOWN_USER;
  }

  async confirmChat(userId: number, room: Rooms) {
    const clientType = this.getUserType(room, userId);
    if (clientType == UNKNOWN_USER) {
      console.error("Failed to join room unknown user", userId);
      return;
    }
    await this.updateConfirmTime(room.id, clientType);
  }

  async IsLeaveAll(roomId: number): Promise<boolean> {
    const room = await this.getRoomById(roomId);

    if (room.buyer_out && room.seller_out) return true;
    else return false;
  }

  async leaveRoom(userId: number, roomId: number) {
    try {
      const room = await this.getRoomById(roomId);

      if (room.buyer_id == userId) {
        await this.RoomRepository.update(
          {
            id: roomId,
          },
          { ...room, buyer_out: true }
        );
      } else {
        await this.RoomRepository.update(
          {
            id: roomId,
          },
          { ...room, seller_out: true }
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @brief          전달된 Room의 식별자 전달
   *
   * @param room     찾고자하는 혹은 추가할 Room 인터페이스
   * @returns        찾고자하는 혹은 추가된 Room Id
   */
  async deleteRoom(room: Rooms) {
    try {
      await this.ChatRepository.delete({
        room,
      });

      await this.RoomRepository.delete({
        id: room.id,
      });

      console.log(`Success to Delete Room [${room.id}]`);
    } catch (err) {
      console.error(err);
    }
  }
}
