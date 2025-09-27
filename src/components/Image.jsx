import { useState, useEffect } from 'react';

export default function Image({ src, alt, style, type = 'profile', ...props }) {
    // 사용 목적에 따른 fallback 이미지 설정
    const getFallbackImages = imageType => {
        if (imageType === 'logo') {
            return [
                '/chaticon.png', // 로고용 fallback
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNCIgZmlsbD0iIzgwY2FmZiIvPgo8dGV4dCB4PSIyMCIgeT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPkxPR088L3RleHQ+Cjwvc3ZnPg=='
            ];
        } else {
            // profile 타입 (기본값)
            return [
                '/기본프사.png', // 프로필용 fallback
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNkZGQiLz4KPHBhdGggZD0iTTIwIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIgZmlsbD0iIzk5OSIvPgo8L3N2Zz4='
            ];
        }
    };

    const fallbackImages = getFallbackImages(type);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1: 원본 이미지, 0+: fallback 인덱스
    const [imgSrc, setImgSrc] = useState(src || fallbackImages[0]);

    // src prop이 변경되면 초기화
    useEffect(() => {
        const currentFallbacks = getFallbackImages(type);
        if (src) {
            setImgSrc(src);
            setCurrentIndex(-1);
        } else {
            // src가 없으면 바로 첫 번째 fallback 사용
            setImgSrc(currentFallbacks[0]);
            setCurrentIndex(0);
        }
    }, [src, type]);

    const handleError = () => {
        const nextIndex = currentIndex + 1;

        if (nextIndex < fallbackImages.length) {
            console.log(
                `이미지 로딩 실패, fallback 시도 중... (${nextIndex + 1}/${fallbackImages.length})`
            );
            setCurrentIndex(nextIndex);
            setImgSrc(fallbackImages[nextIndex]);
        } else {
            console.warn('모든 이미지 로딩에 실패했습니다:', src);
        }
    };

    const handleLoad = () => {
        // 이미지가 성공적으로 로드되면 로그 출력
        if (currentIndex >= 0) {
            console.log('Fallback 이미지가 성공적으로 로드되었습니다:', imgSrc);
        }
    };

    return (
        <div style={{ ...style }}>
            <img
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'inherit',
                    backgroundColor: '#f0f0f0' // 로딩 중 배경색
                }}
                src={imgSrc}
                alt={alt || '프로필 이미지'}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        </div>
    );
}
