import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chats } from "./entities/chat.entity";
import { Rooms } from "./entities/room.entity";
import { CreateRoomDto } from "./dto/create-room.dto";
import { CreateChatDto } from "./dto/create-chat.dto";
import { pagenation_chat_size } from "src/common/define";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Rooms) private RoomRepository: Repository<Rooms>,
    @InjectRepository(Chats) private ChatRepository: Repository<Chats>
  ) {} // @InjectRepository

  /**
   * @brief          전달된 Room의 식별자 전달
   *
   * @param room     찾고자하는 혹은 추가할 Room 인터페이스
   * @returns        찾고자하는 혹은 추가된 Room Id
   */
  async getRoomId(room: Rooms | CreateRoomDto): Promise<string> {
    let target_room: Rooms;

    try {
      target_room = await this.RoomRepository.findOneBy({
        content_id: room.content_id,
        buyer_id: room.buyer_id,
      });
    } catch (err) {
      console.error(err);
    }

    if (target_room == null) {
      target_room = await this.RoomRepository.save(room as CreateRoomDto);
      console.log("Create New Room: ", target_room);
      console.log("New Room Id: ", target_room.id);
    }

    return String(target_room.id);
  }

  /**
   * @brief          전달된 Room의 식별자 전달
   *
   * @param room     찾고자하는 혹은 추가할 Room 인터페이스
   * @returns        찾고자하는 혹은 추가된 Room Id
   */
  async getRoom(room: CreateRoomDto): Promise<Rooms> {
    let target_room: Rooms;

    try {
      target_room = await this.RoomRepository.findOneBy({
        content_id: room.content_id,
        buyer_id: room.buyer_id,
      });
    } catch (err) {
      console.error(err);
    }

    if (target_room == null) {
      target_room = await this.RoomRepository.save(room as CreateRoomDto);
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
    let target_room_list: Rooms[] = await this.RoomRepository.find({
      where: [
        {
          buyer_id: userId,
        },
        {
          seller_id: userId,
        },
      ],
    });

    return target_room_list;
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
        .skip(
          page * pagenation_chat_size != 0 ? page * pagenation_chat_size : 0
        )
        .getManyAndCount();
    } catch (err) {
      console.error(err);
    }

    return res;
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
   * @brief          전달된 Room의 식별자 전달
   *
   * @param room     찾고자하는 혹은 추가할 Room 인터페이스
   * @returns        찾고자하는 혹은 추가된 Room Id
   */
  async deleteRoom(roomId: number) {
    try {
      await this.RoomRepository.delete({
        id: roomId,
      });

      console.log(`Success to Delete Room [${roomId}]`);
    } catch (err) {
      console.error(err);
    }
  }
}
