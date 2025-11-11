export class UIManager {
    // ... остальной код ...

    initModal(onCreateRoom, onJoinRoom, onStartSingleGame) {
        const modal = document.getElementById('modeModal');
        const modeBtns = document.querySelectorAll('.mode-btn');
        const serverSettings = document.getElementById('serverSettings');
        const startBtn = document.getElementById('startBtn');
        const statusElement = document.getElementById('networkStatus');
        const createRoomBtn = document.getElementById('createRoomBtn');
        const joinRoomBtn = document.getElementById('joinRoomBtn');
        const roomIdInput = document.getElementById('roomId');
        const playerNameInput = document.getElementById('playerName');
        const roomIdGroup = roomIdInput.closest('.form-group');

        // Восстанавливаем ID комнаты если есть
        const savedRoomId = localStorage.getItem('lastRoomId');
        if (savedRoomId) {
            roomIdInput.value = savedRoomId;
        }

        // Переключение режимов
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const gameMode = btn.dataset.mode;
                
                if (gameMode === 'network') {
                    serverSettings.classList.add('active');
                    statusElement.textContent = 'Выберите действие...';
                    statusElement.className = 'status-message status-waiting';
                    // Показываем поле ID комнаты по умолчанию
                    roomIdGroup.style.display = 'block';
                } else {
                    serverSettings.classList.remove('active');
                }
            });
        });

        // Создание комнаты - ПРОСТАЯ ВЕРСИЯ
        createRoomBtn.addEventListener('click', async () => {
            const playerName = playerNameInput.value.trim();

            if (!playerName) {
                statusElement.textContent = 'Введите ваше имя!';
                return;
            }

            statusElement.textContent = 'Создаем комнату...';
            createRoomBtn.disabled = true;
            joinRoomBtn.disabled = true;

            try {
                await onCreateRoom(playerName, statusElement);
            } catch (error) {
                statusElement.textContent = 'Ошибка создания комнаты!';
                statusElement.className = 'status-message status-waiting';
                createRoomBtn.disabled = false;
                joinRoomBtn.disabled = false;
            }
        });

        // Присоединение к комнате - ПРОСТАЯ ВЕРСИЯ
        joinRoomBtn.addEventListener('click', async () => {
            const roomId = roomIdInput.value.trim();
            const playerName = playerNameInput.value.trim();

            if (!roomId) {
                statusElement.textContent = 'Введите ID комнаты!';
                return;
            }

            if (!playerName) {
                statusElement.textContent = 'Введите ваше имя!';
                return;
            }

            statusElement.textContent = 'Присоединяемся к комнате...';
            createRoomBtn.disabled = true;
            joinRoomBtn.disabled = true;

            try {
                await onJoinRoom(roomId, playerName, statusElement);
            } catch (error) {
                statusElement.textContent = error.message || 'Не удалось присоединиться! Проверьте ID комнаты.';
                statusElement.className = 'status-message status-waiting';
                createRoomBtn.disabled = false;
                joinRoomBtn.disabled = false;
            }
        });

        // Одиночная игра
        startBtn.addEventListener('click', () => {
            const playerName = playerNameInput.value.trim() || 'Игрок';
            onStartSingleGame(playerName);
        });
    }

    showRoomCreated(roomId, statusElement) {
        statusElement.textContent = `Комната создана! ID: ${roomId}`;
        statusElement.className = 'status-message status-connected';
        
        // Показываем кнопку копирования
        this.showCopyRoomIdButton(roomId, statusElement);
    }

    showCopyRoomIdButton(roomId, statusElement) {
        // Удаляем старую кнопку если есть
        const oldBtn = document.querySelector('.copy-room-btn');
        if (oldBtn) {
            oldBtn.remove();
        }

        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn copy-room-btn';
        copyBtn.textContent = '📋 Скопировать ID комнаты';
        copyBtn.style.marginTop = '10px';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(roomId).then(() => {
                statusElement.textContent = 'ID комнаты скопирован!';
                setTimeout(() => {
                    statusElement.textContent = `Комната создана! ID: ${roomId}`;
                }, 2000);
            }).catch(() => {
                // Fallback для старых браузеров
                const tempInput = document.createElement('input');
                tempInput.value = roomId;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                statusElement.textContent = 'ID скопирован!';
            });
        });
        
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.parentNode.appendChild(copyBtn);
        }
    }

    initGameControls(onNewMovie, onClearField, onDisconnect, isHost = false) {
        const newMovieBtn = document.getElementById('newMovieBtn');
        const clearFieldBtn = document.getElementById('clearFieldBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');

        // Удаляем старые обработчики
        newMovieBtn.replaceWith(newMovieBtn.cloneNode(true));
        clearFieldBtn.replaceWith(clearFieldBtn.cloneNode(true));
        disconnectBtn.replaceWith(disconnectBtn.cloneNode(true));

        // Получаем обновленные элементы
        const newNewMovieBtn = document.getElementById('newMovieBtn');
        const newClearFieldBtn = document.getElementById('clearFieldBtn');
        const newDisconnectBtn = document.getElementById('disconnectBtn');

        // Показываем кнопки только хосту
        if (isHost) {
            newNewMovieBtn.style.display = 'block';
            newClearFieldBtn.style.display = 'block';
            newNewMovieBtn.addEventListener('click', onNewMovie);
            newClearFieldBtn.addEventListener('click', onClearField);
        } else {
            newNewMovieBtn.style.display = 'none';
            newClearFieldBtn.style.display = 'none';
        }

        // Кнопка отключения показывается всем
        newDisconnectBtn.addEventListener('click', onDisconnect);
    }

    // ... остальные методы без изменений ...
}
