# Tổng Hợp & Đọc Hiểu Các Kịch Bản Trong Thư Mục `scratch/`

Tài liệu này cung cấp tóm tắt, mục đích sử dụng, cơ chế hoạt động và dữ liệu vào/ra của tất cả các kịch bản Python hỗ trợ phát triển dự án nông trại hiện có trong thư mục `scratch/`.

---

## Danh Sách Các Kịch Bản

### 1. [generate_animals.py](file:///Users/thiennq/workspace/personal/farm/scratch/generate_animals.py)
*   **Mục đích**: Tự động vẽ các khung hình (frames) pixel art và ghép chúng thành các tấm ảnh lớn (spritesheets) cho động vật trong nông trại (gà trắng, gà nâu, bò sữa, cừu).
*   **Cơ chế hoạt động**:
    *   Sử dụng thư viện `Pillow` (PIL) để tải lưới vẽ bằng các ký tự đại diện cho mã màu (ví dụ: `w` = trắng, `s` = đốm đen, `p` = hồng...).
    *   Tự động vẽ các lưới ảnh kích thước 16x16 (với gà) và 32x32 (với bò, cừu) cho các tư thế di chuyển (Idle, Walk, Eat) theo 4 hướng (Down, Up, Left, Right).
    *   Tự động đảo ngược ảnh theo chiều ngang (flip horizontally) để sinh hướng đi đối xứng mà không cần vẽ lại.
    *   Ghép các khung hình riêng lẻ vào lưới ảnh spritesheet dạng PNG và lưu trực tiếp vào thư mục `public/assets/animals/`.

### 2. [convert_tmx.py](file:///Users/thiennq/workspace/personal/farm/scratch/convert_tmx.py)
*   **Mục đích**: Chuyển đổi định dạng file thiết kế bản đồ từ dạng XML TMX của phần mềm Tiled sang định dạng JSON mà Phaser có thể đọc được.
*   **Cơ chế hoạt động**:
    *   Sử dụng thư viện `xml.etree.ElementTree` để parse tệp cấu trúc XML của `.tmx` và các tệp tsx tileset đi kèm.
    *   Đọc và trích xuất kích thước bản đồ, thông số tilesets, dữ liệu các lớp bản đồ dạng CSV.
    *   Chuẩn hóa các đường dẫn thư mục ảnh từ môi trường đồ họa cục bộ thành các đường dẫn tương đối trỏ đến thư mục tĩnh `assets/` của dự án.
    *   Xuất file JSON hoàn chỉnh tại `public/assets/data/map.json`.

### 3. [count_conversations.py](file:///Users/thiennq/workspace/personal/farm/scratch/count_conversations.py)
*   **Mục đích**: Tìm kiếm và đếm số lượng cuộc hội thoại (conversations) có chứa hoặc liên quan đến workspace phát triển hiện tại trên máy của người dùng.
*   **Cơ chế hoạt động**:
    *   Duyệt qua các thư mục lưu lịch sử của hệ thống AI Agent (`.gemini/antigravity-ide/brain/`).
    *   Đọc tệp tin nhật ký `transcript.jsonl` trong mỗi cuộc trò chuyện, tìm kiếm chuỗi đường dẫn thư mục dự án (`/Users/thiennq/workspace/personal/farm`).
    *   In ra màn hình tổng số cuộc trò chuyện trùng khớp và danh sách các ID tương ứng.

### 4. [parse_logs_grouped.py](file:///Users/thiennq/workspace/personal/farm/scratch/parse_logs_grouped.py)
*   **Mục đích**: Trích xuất dữ liệu chat thô từ nhiều ID cuộc hội thoại và gộp chung lại thành một tệp nhật ký Markdown duy nhất.
*   **Cơ chế hoạt động**:
    *   Duyệt qua các file `transcript.jsonl` của 4 cuộc hội thoại được định nghĩa trước.
    *   Trích xuất nội dung thẻ `<USER_REQUEST>` làm câu hỏi của User, loại bỏ các bước hoạt động tự động của người dùng (như click chuột, xem file tự động).
    *   Trích xuất nội dung phản hồi `PLANNER_RESPONSE` từ mô hình làm câu trả lời của AI.
    *   Ghi tất cả vào file đầu ra `chatlog.md`.

### 5. [inspect_user.py](file:///Users/thiennq/workspace/personal/farm/scratch/inspect_user.py)
*   **Mục đích**: Hỗ trợ kiểm toán (audit) nhanh các câu lệnh yêu cầu của User trong các cuộc hội thoại cụ thể.
*   **Cơ chế hoạt động**: Đọc qua các tệp `transcript.jsonl` của các ID hội thoại đích và in ra màn hình 200 ký tự đầu tiên của mỗi bước tương tác của người dùng để quan sát nhanh cấu trúc.

### 6. [clean_chatlogs.py](file:///Users/thiennq/workspace/personal/farm/scratch/clean_chatlogs.py)
*   **Mục đích**: Định dạng lại file Markdown chatlog bằng cách xử lý các ký tự escape.
*   **Cơ chế hoạt động**: Tìm và thay thế các chuỗi escape dấu ngoặc kép `\"` thành dấu ngoặc kép thông thường `"` bên trong các dòng khai báo gọi công cụ (tool logs) để giúp giao diện trông sạch và tự nhiên hơn.

### 7. [clean_call_tool.py](file:///Users/thiennq/workspace/personal/farm/scratch/clean_call_tool.py)
*   **Mục đích**: Loại bỏ các tiền tố thừa thãi trong nhật ký công cụ của AI.
*   **Cơ chế hoạt động**: Đọc file chatlog và thay thế chuỗi `- Call tool \`tên_tool\`` thành `- \`tên_tool\`` để tinh giản số ký tự hiển thị.

### 8. [clean_tool_args.py](file:///Users/thiennq/workspace/personal/farm/scratch/clean_tool_args.py)
*   **Mục đích**: Rút gọn các đối số dài dòng của cuộc gọi công cụ về định dạng ngắn gọn chỉ có tham số chính.
*   **Cơ chế hoạt động**: Sử dụng Regular Expressions (RegEx) để phát hiện cấu trúc dạng JSON của các lệnh gọi `list_dir`, `view_file`, `write_to_file`, `run_command` và chuyển đổi chúng thành dạng `- \`tên_tool\`: \`tham_số_chính\``.

### 9. [clean_last_turns.py](file:///Users/thiennq/workspace/personal/farm/scratch/clean_last_turns.py)
*   **Mục đích**: Cắt bớt (prune/truncate) nội dung chatlog tại một điểm đích cụ thể.
*   **Cơ chế hoạt động**: Tìm vị trí xuất hiện của tiêu đề câu hỏi User thứ 6 (`## 👤 User`) và loại bỏ hoàn toàn phần nội dung từ vị trí đó trở đi để phục vụ việc giới hạn độ dài hiển thị trên trang Dashboard báo cáo.

### 10. [replace_q6_prompt.py](file:///Users/thiennq/workspace/personal/farm/scratch/replace_q6_prompt.py)
*   **Mục đích**: Thay đổi nội dung của lượt yêu cầu thứ 6 của User bằng một đoạn văn ngắn gọn, súc tích và có văn phong tự nhiên hơn.
*   **Cơ chế hoạt động**: Tìm khối câu hỏi thứ 6 trong chatlog, bóc tách vùng mã trong dấu block code ``` và ghi đè nội dung mới đã được tối ưu hóa vào vị trí đó.
