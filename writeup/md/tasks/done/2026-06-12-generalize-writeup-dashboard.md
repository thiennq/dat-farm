---
title: "Tổng quát hóa Writeup Dashboard Controller"
status: "backlog"
priority: "medium"
created: "2026-06-12"
depends_on: []
tags: ["refactor", "writeup", "dashboard"]
---

# Tổng quát hóa Writeup Dashboard Controller

## Bối cảnh

Hiện tại, trang Writeup Dashboard (`public/writeup/`) đang chứa dữ liệu cây thư mục (`fileTreeData`) và các cấu hình giao diện (tên tiêu đề, logo) bị fix cứng trực tiếp trong mã nguồn JavaScript (`script.js`). Điều này làm giảm khả năng tái sử dụng mã nguồn cho các dự án khác, đồng thời gây khó khăn cho việc bảo trì, cập nhật file log hoặc thay đổi giao diện mà không muốn can thiệp sâu vào code JS logic.

## Mục tiêu

Tách biệt cấu hình và logic bằng cách tái cấu trúc `script.js` thành một Class/Module JavaScript tổng quát (ví dụ: `WriteupDashboard`), đồng thời tải động toàn bộ cấu hình (file tree, giao diện, theme màu) từ tệp tin `config.json` bên ngoài.

## Yêu cầu

### Input / Trigger
*   Trang Dashboard đọc cấu hình đầu vào từ tệp tin tĩnh `config.json` được fetch động khi khởi tạo trang.

### Output / Behavior
*   **Tệp tin cấu hình `config.json`**:
    *   Chứa thông tin tiêu đề chính (`title`), phụ (`subtitle`), biểu tượng logo (`logo`).
    *   Chứa mảng cây thư mục (`fileTreeData`) của các log.
    *   Chứa định nghĩa file log cần kích hoạt tính năng timeline/collapsible (`collapsibleFile`).
    *   Chứa cấu hình trạng thái mở rộng cây thư mục mặc định (`defaultExpanded`).
    *   Chứa tùy biến bảng màu (`theme`) hỗ trợ ghi đè các biến CSS chính (accent, bg, border, text).
*   **Logic Javascript (`script.js`)**:
    *   Đóng gói toàn bộ logic xử lý (render cây thư mục, bóc tách YAML frontmatter, tính toán vị trí cuộn cho timeline và scrollspy) vào trong Class `WriteupDashboard`.
    *   Khởi tạo dễ dàng từ HTML:
        ```javascript
        const dashboard = new WriteupDashboard({
            configPath: 'config.json'
        });
        dashboard.init();
        ```
    *   Đọc cấu hình màu sắc trong trường `theme` của JSON và ghi đè động vào `:root` CSS Variables thông qua `document.documentElement.style.setProperty()`.

### Constraints & Rules
*   Mã nguồn sau khi tái cấu trúc phải giữ nguyên toàn bộ các tính năng hiện có: điều hướng timeline đính ở topbar, scrollspy cập nhật URL Hash, thu gọn AI turn (collapsible), và hiển thị responsive mobile.
*   Bảo toàn hiệu năng scrollspy tính trước tọa độ các node tiêu đề để tránh giật lag.

---

## Thiết kế kỹ thuật

### Files cần tạo/sửa
| File | Action |
|------|--------|
| `public/writeup/config.json` | MỚI |
| `public/writeup/script.js` | SỬA |
| `public/writeup/index.html` | SỬA |

### Cấu trúc file cấu hình đề xuất (`config.json`)
```json
{
  "title": "Dat Farm",
  "subtitle": "Project logs & tasks",
  "logo": "🌾",
  "collapsibleFile": "chatlog.md",
  "defaultExpanded": true,
  "theme": {
    "accent": "#10b981",
    "accent-hover": "#34d399",
    "bg-primary": "#0f172a",
    "bg-secondary": "#1e293b",
    "bg-tertiary": "#0b0f19"
  },
  "fileTree": [
    {
      "name": "chatlog.md",
      "type": "file",
      "path": "md/chatlog.md"
    },
    {
      "name": "tasks",
      "type": "directory",
      "children": [
        {
          "name": "done",
          "type": "directory",
          "children": [
            {
              "name": "2026-06-12-01-setup-project-and-assets.md",
              "type": "file",
              "path": "md/tasks/done/2026-06-12-01-setup-project-and-assets.md"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Checklist

- [ ] Tạo tệp tin cấu hình mẫu [config.json](file://farm/public/writeup/config.json) chứa các cấu hình giao diện và mảng fileTree hiện tại.
- [ ] Refactor [script.js](file://farm/public/writeup/script.js) để đóng gói toàn bộ logic điều hướng, render và scrollspy vào class `WriteupDashboard`.
- [ ] Viết hàm `applyTheme()` trong class để đọc trường `theme` của JSON và cập nhật động các biến CSS vào `:root`.
- [ ] Cập nhật tệp [index.html](file://farm/public/writeup/index.html) để nạp và khởi tạo Class `WriteupDashboard` từ tệp cấu hình JSON.
- [ ] Chạy kiểm thử local dev server để xác minh:
    - [ ] Tiêu đề, subtitle và logo hiển thị đúng cấu hình JSON.
    - [ ] Cây thư mục mở rộng mặc định đúng cấu hình.
    - [ ] Chọn file `.md` tải nội dung thành công, timeline và collapsible hoạt động bình thường.
    - [ ] Khả năng tùy biến theme màu sắc hoạt động bình thường khi thay đổi giá trị trong JSON.
- [ ] Biên dịch dự án bằng `npm run build` và deploy bản build mới lên GitHub Pages.
- [ ] Tạo file walkthrough ghi nhận quá trình refactor.

---

## Notes & Open Questions

*   Cần đảm bảo việc fetch động `config.json` xử lý ngoại lệ tốt nếu tệp tin bị thiếu hoặc sai định dạng JSON.
