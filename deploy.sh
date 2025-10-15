#!/bin/bash

# ========================================
# 自动部署脚本
# 用于手动部署到服务器（不使用 GitHub Actions）
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量（请根据实际情况修改）
SERVER_USER="your-username"           # 服务器用户名
SERVER_HOST="your-server-ip"          # 服务器 IP 或域名
SERVER_PORT="22"                      # SSH 端口
DEPLOY_PATH="/var/www/mini-social-media/dist"  # 部署路径
BUILD_DIR="dist"                      # 本地构建目录

# 函数：打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 主流程
main() {
    print_info "=== 开始部署流程 ==="
    
    # 1. 检查必要的命令
    print_info "检查必要的工具..."
    check_command node
    check_command npm
    check_command ssh
    check_command scp
    
    # 2. 清理旧的构建文件
    print_info "清理旧的构建文件..."
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_info "已删除旧的 $BUILD_DIR 目录"
    fi
    
    # 3. 安装依赖
    print_info "安装依赖..."
    npm ci
    
    # 4. 构建项目
    print_info "构建项目..."
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "构建失败，未找到 $BUILD_DIR 目录"
        exit 1
    fi
    
    print_info "构建成功！"
    
    # 5. 测试 SSH 连接
    print_info "测试服务器连接..."
    if ! ssh -p $SERVER_PORT -o ConnectTimeout=10 $SERVER_USER@$SERVER_HOST "echo '连接成功'" > /dev/null 2>&1; then
        print_error "无法连接到服务器，请检查配置"
        exit 1
    fi
    print_info "服务器连接正常"
    
    # 6. 备份服务器上的旧文件（可选）
    print_info "备份服务器上的旧文件..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
        if [ -d '$DEPLOY_PATH' ]; then
            backup_dir='${DEPLOY_PATH}_backup_$(date +%Y%m%d_%H%M%S)'
            cp -r '$DEPLOY_PATH' \"\$backup_dir\"
            echo \"备份已创建：\$backup_dir\"
        fi
    "
    
    # 7. 上传文件到服务器
    print_info "上传文件到服务器..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $DEPLOY_PATH"
    scp -P $SERVER_PORT -r $BUILD_DIR/* $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH/
    
    if [ $? -eq 0 ]; then
        print_info "文件上传成功！"
    else
        print_error "文件上传失败"
        exit 1
    fi
    
    # 8. 设置文件权限
    print_info "设置文件权限..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "
        sudo chown -R www-data:www-data $DEPLOY_PATH
        sudo chmod -R 755 $DEPLOY_PATH
    "
    
    # 9. 测试 Nginx 配置
    print_info "测试 Nginx 配置..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "sudo nginx -t"
    
    # 10. 重启 Nginx
    print_info "重启 Nginx..."
    ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "sudo systemctl reload nginx"
    
    print_info "=== 部署完成！==="
    print_info "网站地址: http://$SERVER_HOST"
    print_warning "请访问网站验证部署是否成功"
}

# 脚本使用说明
usage() {
    echo "用法: $0"
    echo ""
    echo "部署前请先修改脚本中的配置变量："
    echo "  SERVER_USER   - 服务器用户名"
    echo "  SERVER_HOST   - 服务器 IP 或域名"
    echo "  SERVER_PORT   - SSH 端口（默认 22）"
    echo "  DEPLOY_PATH   - 部署路径"
    echo ""
    echo "示例："
    echo "  ./deploy.sh"
}

# 检查是否需要显示帮助
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    usage
    exit 0
fi

# 确认部署
print_warning "即将部署到服务器: $SERVER_USER@$SERVER_HOST:$DEPLOY_PATH"
read -p "确认继续？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "部署已取消"
    exit 0
fi

# 执行主流程
main

