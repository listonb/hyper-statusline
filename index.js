// Require
const { shell } = require('electron');
const { exec } = require('child_process');
const tildify = require('tildify');

// Config
exports.decorateConfig = (config) => {
    const hyperStatusLine = Object.assign({
        footerTransparent: true,
        dirtyColor: config.colors.lightYellow,
        arrowsColor: config.colors.blue,
        fontSize: 12,
    }, config.hyperStatusLine);

    return Object.assign({}, config, {
        css: `
            ${config.css || ''}
            .terms_terms {
                margin-bottom: 30px;
            }
            .footer_footer {
                display: flex;
                justify-content: space-between;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 100;
                font-family: ${config.uiFontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'};
                font-size: ${hyperStatusLine.fontSize}px;
                height: 30px;
                padding: 0 14px 1px;
                opacity: ${hyperStatusLine.footerTransparent ? '0.5' : '1'};
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
            }
            .footer_footer:hover {
                opacity: 1;
            }
            .footer_footer:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
                width: 100%;
                height: 100%;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                background-color: ${config.foregroundColor || 'transparent'};
                opacity: 0.07;
            }
            .item_item {
                position: relative;
                display: flex;
                align-items: center;
                color: ${config.foregroundColor || 'white'};
                white-space: nowrap;
                background-repeat: no-repeat;
                background-position: left center;
                opacity: 0;
                pointer-events: none;
            }
            .item_active {
                opacity: 0.7;
                pointer-events: auto;
            }
            .item_active:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 14px;
                height: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: left center;
                background-color: ${config.foregroundColor || 'white'};
            }
            .item_gitdata {
                display: inherit;
                position: relative;
            }
            .item_folder {
                display: inline-block;
                text-overflow: ellipsis;
                padding-left: 21px;
                overflow: hidden;
            }
            .item_folder:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE0IDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMywyIEw3LDIgTDcsMSBDNywwLjM0IDYuNjksMCA2LDAgTDEsMCBDMC40NSwwIDAsMC40NSAwLDEgTDAsMTEgQzAsMTEuNTUgMC40NSwxMiAxLDEyIEwxMywxMiBDMTMuNTUsMTIgMTQsMTEuNTUgMTQsMTEgTDE0LDMgQzE0LDIuNDUgMTMuNTUsMiAxMywyIEwxMywyIFogTTYsMiBMMSwyIEwxLDEgTDYsMSBMNiwyIEw2LDIgWiIvPjwvc3ZnPg==');
                -webkit-mask-size: 14px 12px;
            }
            .item_branch {
                padding-left: 30px;
            }
            .item_branch:before {
                left: 14.5px;
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgOSAxMiI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOSwzLjQyODU3NzQ2IEM5LDIuNDc3MTQ4ODggOC4xOTksMS43MTQyOTE3NCA3LjIsMS43MTQyOTE3NCBDNi4zODY5NDE5NCwxLjcxMjI0NTc4IDUuNjc0MTI3NDksMi4yMzEzMDI2NCA1LjQ2MzA1NjAyLDIuOTc5MDk4NzEgQzUuMjUxOTg0NTQsMy43MjY4OTQ3OCA1LjU5NTQ1MzE3LDQuNTE2Mzc3NDEgNi4zLDQuOTAyODYzMTcgTDYuMyw1LjE2MDAwNjAzIEM2LjI4Miw1LjYwNTcyMDMxIDYuMDkzLDYuMDAwMDA2MDMgNS43MzMsNi4zNDI4NjMxNyBDNS4zNzMsNi42ODU3MjAzMSA0Ljk1OSw2Ljg2NTcyMDMxIDQuNDkxLDYuODgyODYzMTcgQzMuNzQ0LDYuOTAwMDA2MDMgMy4xNTksNy4wMjAwMDYwMyAyLjY5MSw3LjI2ODU3NzQ2IEwyLjY5MSwzLjE4ODU3NzQ2IEMzLjM5NTU0NjgzLDIuODAyMDkxNyAzLjczOTAxNTQ2LDIuMDEyNjA5MDcgMy41Mjc5NDM5OCwxLjI2NDgxMjk5IEMzLjMxNjg3MjUxLDAuNTE3MDE2OTIzIDIuNjA0MDU4MDYsLTAuMDAyMDM5OTM0MTUgMS43OTEsNi4wMjY4NzM4NWUtMDYgQzAuNzkyLDYuMDI2ODczODVlLTA2IDkuOTkyMDA3MjJlLTE3LDAuNzYyODYzMTcgOS45OTIwMDcyMmUtMTcsMS43MTQyOTE3NCBDMC4wMDM4NTgyMzAyNiwyLjMyMzA1MzU2IDAuMzQ2NDE5ODM1LDIuODg0MjAyMDkgMC45LDMuMTg4NTc3NDYgTDAuOSw4LjgxMTQzNDYgQzAuMzY5LDkuMTExNDM0NiAwLDkuNjYwMDA2MDMgMCwxMC4yODU3MjAzIEMwLDExLjIzNzE0ODkgMC44MDEsMTIuMDAwMDA2IDEuOCwxMi4wMDAwMDYgQzIuNzk5LDEyLjAwMDAwNiAzLjYsMTEuMjM3MTQ4OSAzLjYsMTAuMjg1NzIwMyBDMy42LDkuODMxNDM0NiAzLjQyLDkuNDI4NTc3NDYgMy4xMjMsOS4xMjAwMDYwMyBDMy4yMDQsOS4wNjg1Nzc0NiAzLjU1NSw4Ljc2ODU3NzQ2IDMuNjU0LDguNzE3MTQ4ODggQzMuODc5LDguNjIyODYzMTcgNC4xNTgsOC41NzE0MzQ2IDQuNSw4LjU3MTQzNDYgQzUuNDQ1LDguNTI4NTc3NDYgNi4yNTUsOC4xODU3MjAzMSA2Ljk3NSw3LjUwMDAwNjAzIEM3LjY5NSw2LjgxNDI5MTc0IDguMDU1LDUuODAyODYzMTcgOC4xLDQuOTExNDM0NiBMOC4wODIsNC45MTE0MzQ2IEM4LjYzMSw0LjYwMjg2MzE3IDksNC4wNTQyOTE3NCA5LDMuNDI4NTc3NDYgTDksMy40Mjg1Nzc0NiBaIE0xLjgsMC42ODU3MjAzMTMgQzIuMzk0LDAuNjg1NzIwMzEzIDIuODgsMS4xNTcxNDg4OCAyLjg4LDEuNzE0MjkxNzQgQzIuODgsMi4yNzE0MzQ2IDIuMzg1LDIuNzQyODYzMTcgMS44LDIuNzQyODYzMTcgQzEuMjE1LDIuNzQyODYzMTcgMC43MiwyLjI3MTQzNDYgMC43MiwxLjcxNDI5MTc0IEMwLjcyLDEuMTU3MTQ4ODggMS4yMTUsMC42ODU3MjAzMTMgMS44LDAuNjg1NzIwMzEzIEwxLjgsMC42ODU3MjAzMTMgWiBNMS44LDExLjMyMjg2MzIgQzEuMjA2LDExLjMyMjg2MzIgMC43MiwxMC44NTE0MzQ2IDAuNzIsMTAuMjk0MjkxNyBDMC43Miw5LjczNzE0ODg4IDEuMjE1LDkuMjY1NzIwMzEgMS44LDkuMjY1NzIwMzEgQzIuMzg1LDkuMjY1NzIwMzEgMi44OCw5LjczNzE0ODg4IDIuODgsMTAuMjk0MjkxNyBDMi44OCwxMC44NTE0MzQ2IDIuMzg1LDExLjMyMjg2MzIgMS44LDExLjMyMjg2MzIgTDEuOCwxMS4zMjI4NjMyIFogTTcuMiw0LjQ2NTcyMDMxIEM2LjYwNiw0LjQ2NTcyMDMxIDYuMTIsMy45OTQyOTE3NCA2LjEyLDMuNDM3MTQ4ODggQzYuMTIsMi44ODAwMDYwMyA2LjYxNSwyLjQwODU3NzQ2IDcuMiwyLjQwODU3NzQ2IEM3Ljc4NSwyLjQwODU3NzQ2IDguMjgsMi44ODAwMDYwMyA4LjI4LDMuNDM3MTQ4ODggQzguMjgsMy45OTQyOTE3NCA3Ljc4NSw0LjQ2NTcyMDMxIDcuMiw0LjQ2NTcyMDMxIEw3LjIsNC40NjU3MjAzMSBaIi8+PC9zdmc+');
                -webkit-mask-size: 14px 12px;
            }
            .item_user {
                padding-left: 30px;
                float: left;
            }
            .item_user:before {
                left: 14.5px;
                -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iMjA0OHB4IiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgdGV4dC1yZW5kZXJpbmc6Z2VvbWV0cmljUHJlY2lzaW9uOyBpbWFnZS1yZW5kZXJpbmc6b3B0aW1pemVRdWFsaXR5OyBmaWxsLXJ1bGU6ZXZlbm9kZDsgY2xpcC1ydWxlOmV2ZW5vZGQiIHZpZXdCb3g9IjAgMCAyMDQ4IDIwNDgiIHdpZHRoPSIyMDQ4cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+CiAgIDwhW0NEQVRBWwogICAgLmZpbDEge2ZpbGw6bm9uZX0KICAgIC5maWwwIHtmaWxsOiM0MjQyNDI7ZmlsbC1ydWxlOm5vbnplcm99CiAgIF1dPgogIDwvc3R5bGU+PC9kZWZzPjxnIGlkPSJMYXllcl94MDAyMF8xIj48cGF0aCBjbGFzcz0iZmlsMCIgZD0iTTc4NC41OTQgMTc3NS45M2MtNS43Mzg5OCwwIC0xMi4xMDk5LC0wLjU5ODgxOSAtMTkuMTU1MSwtMS44ODYyMmwyLjg3NDgxIC0zMS42MjUyIDI4LjM5MDIgLTAuMDA1OTA1NTJjNC43MTM3OCwtMS4zMTQ1NyA4LjQ1NjcsLTMuNDE1NzUgMTEuMzUzOSwtNi4wMzA3MSA0Ljk2MTgxLC00LjQ3OTkyIDcuODI1OTksLTEwLjY5MzcgOS4wMDExOSwtMTcuMTE3NyAwLjM5MzMwNywtMi4xNTE5NyAwLjU4MjI4NCwtNC41Mjk1MyAwLjU4MjI4NCwtNy4wMzU4MyAwLC0xNy4xNjk3IC0wLjE1MzU0MywtMzMuMjA1NSAtMC4zNTY2OTMsLTU0LjcyNjQgLTAuMjI5MTM0LC0yNC4xNjc3IC0wLjUxNjE0MiwtNTQuMTk2MSAtMC43NTM1NDQsLTg4LjYyMTcgLTI1OC43OTksNDYuOTgzMSAtMzE5LjIxNywtMTM0Ljc3NSAtMzIxLjY5NywtMTQyLjU5NSAtNDEuMTgwMywtMTA0LjA5MSAtOTcuODExOSwtMTMwLjYyOCAtOTcuOTc2MSwtMTMwLjcwN2wtMi4xMjQ4IC0xLjE4ODE5Yy0xMzAuNDM5LC04OS4xNDI2IDE1LjIyOCwtODcuMjk0MiAxNS42NDE0LC04Ny4yOTNsMS4wMDAzOSAwYzEwMi4wMiw3LjE4MTExIDE1Ni4zNTQsMTAxLjI0NCAxNTkuMzE1LDEwNi41bDAuMDEwNjI5OSAtMC4wMDU5MDU1MmMzMS4wMTEsNTMuMTMzMSA2OS4xNjU0LDc5LjMzMzUgMTA3LjA3Niw5MC4xNTcyIDU0Ljk5MjIsMTUuNjk5MiAxMTAuNDQ3LC0wLjE4MTg5IDE0My4yMDQsLTEzLjcyMzIgNC41NDM3LC0yNi44NTgzIDEyLjAyODQsLTUwLjA4MTEgMjEuMzY5NywtNjkuNzUzNiA2LjI5NDEsLTEzLjI1NDMgMTMuNDUyOCwtMjQuOTQyNSAyMS4xNTEyLC0zNS4wOTA2IC05OC44Mjg4LC0xNC4wMjMyIC0xOTcuODcsLTQyLjY1NjcgLTI3NS4yNCwtMTA3Ljc4NiAtODUuODQ0OSwtNzIuMjY1OCAtMTQ0LjAyNywtMTg4LjM0OCAtMTQ0LjAyNywtMzc3LjEyNGwwLjA2MjU5ODUgMGMwLjAwODI2NzcyLC01Mi43ODgyIDkuMTQ1MjgsLTEwMC44NzggMjUuODE4OSwtMTQ0LjMzMSAxNi41MjYsLTQzLjA2ODkgNDAuNDc2NCwtODEuNjU1NiA3MC4zMDA0LC0xMTUuODE3IC01LjcwNTkxLC0xNi4yMTQyIC0xMy42Mjk5LC00NC40NzIxIC0xNi4xMzE1LC04MS44ODEyIC0zLjA1OTA2LC00NS43NTEyIDEuOTMyMjgsLTEwNS40NDcgMjkuMDAyLC0xNzMuODg4bDAuNjI0ODA0IC0xLjI0OTYxYzAuMDE2NTM1NCwtMC4wMzMwNzA5IDExLjc2ODUsLTEwLjA0MTcgMjguMzgwNywtMTAuODgyNyAxMC45NTgzLC0wLjU1MzkzNyAyNy40OTczLDAuMDIxMjU5OSA0OS44MTg5LDQuNTM0MjYgNDMuNDcxNyw4Ljc4OTc3IDExMC4wNiwzMi44OTYxIDIwMS45ODksOTQuMjY4NiAzNi4zMjAxLC05Ljc2NDE4IDczLjgwNiwtMTcuMTgzOSAxMTEuODI5LC0yMi4yOTggNDEuMTQxNCwtNS41MzIyOSA4My4wMzI3LC04LjM3MDQ4IDEyNC44NjksLTguNTU3MDlsMC4xMjUxOTcgMGM0MS43ODk4LDAuMTg2NjE0IDgzLjYzMzksMy4wMjU5OSAxMjQuNzQ5LDguNTU0NzMgMzguMDQxLDUuMTE2NTQgNzUuNTYyMywxMi41NDMzIDExMS45NSwyMi4zMDYzIDE4NC43OTMsLTEyMy40MDQgMjY5Ljk1MSwtOTYuMTg2NyAyNzAuMjAyLC05Ni4xMTM1bDcuNDQ0NDkgMi4yMDc0OCAyLjg2NzcyIDcuMjI5NTNjMjcuMTc0OCw2OC41MzEyIDMyLjIxMzQsMTI4LjE3IDI5LjE4MTUsMTczLjgyNSAtMi40ODM4NiwzNy40MDA4IC0xMC4zNzcyLDY1LjY0NjkgLTE2LjA1OTUsODEuODc0MSAyOS44MDYzLDM0LjA3NiA1My42ODIzLDcyLjYxNDIgNzAuMTcxNywxMTUuNjY3IDE2LjcwOTEsNDMuNjI3NiAyNS44MjEzLDkxLjc5ODkgMjUuODIxMywxNDQuNTUxIDAsMTg5LjI5OSAtNTguMjY4NSwzMDUuMzI3IC0xNDQuMjgxLDM3Ny4zMzUgLTc3LjQyNiw2NC44MjEzIC0xNzYuNTg3LDkzLjA4MDQgLTI3NS42MjYsMTA2Ljg2NSAxMS41ODA3LDE1LjE0NjUgMjEuOTkxLDMzLjc4MzEgMzAuMTE5Myw1NS45NzI1IDEwLjk0MDYsMjkuODcxMyAxNy43OTgsNjYuMjU3NSAxNy43OTgsMTA5LjI3IDAsNzYuNzQ2OSAtMC41NjY5MywxNTYuNTk3IC0wLjk0MTMzOSwyMDkuNDY3IC0wLjEzNzAwOCwxOS40MDA4IC0wLjI0MDk0NSwzMy44OTI5IC0wLjI0MDk0NSw1My4wNDY5bC0wLjA2MjU5ODUgMGMwLjAwMTE4MTEsMi4zOTI5MiAwLjI0Njg1MSw0Ljk1OTQ1IDAuNzYxODEyLDcuNjI5OTMgMS4yMzMwNyw2LjM5NDQ5IDQuMDY0MTgsMTIuNTEwMiA4LjkwMDc5LDE2Ljg0NjEgMi42NTA0LDIuMzc2MzggNi4wMTQxOCw0LjMxNDU3IDEwLjE4ODIsNS42MDQzNGwzMC4wMDU5IC0wLjAwNTkwNTUyIDMgMzEuNjI1MmMtNy4xMDkwNiwxLjM3MDA4IC0xMy44MzA3LDIuMDA2NjkgLTIwLjE2MjYsMi4wMTAyNCAtNi4xMzIyOSwwLjAwMzU0MzMxIC0xMS43ODAzLC0wLjYxMTgxMSAtMTYuOTY3NywtMS43NTI3NmwtNTM4LjY4OSAwLjEwMjc1NmMtNS4wNTUxMiwxLjA2NTM2IC0xMC41MzQzLDEuNjQxNzMgLTE2LjQ2MSwxLjY0MTczeiIvPjwvZz48cmVjdCBjbGFzcz0iZmlsMSIgaGVpZ2h0PSIyMDQ4IiB3aWR0aD0iMjA0OCIvPjwvc3ZnPg==');
                -webkit-mask-size: 14px 12px;
            }
            .item_click:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .item_folder, .item_text {
                line-height: 29px;
            }
            .item_text {
                height: 100%;
            }
            .item_icon {
                display: none;
                width: 12px;
                height: 100%;
                margin-left: 9px;
                -webkit-mask-size: 12px 12px;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: 0 center;
            }
            .icon_active {
                display: inline-block;
            }
            .icon_dirty {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS4xNDI4NTcxLDAgTDAuODU3MTQyODU3LDAgQzAuMzg1NzE0Mjg2LDAgMCwwLjM4NTcxNDI4NiAwLDAuODU3MTQyODU3IEwwLDExLjE0Mjg1NzEgQzAsMTEuNjE0Mjg1NyAwLjM4NTcxNDI4NiwxMiAwLjg1NzE0Mjg1NywxMiBMMTEuMTQyODU3MSwxMiBDMTEuNjE0Mjg1NywxMiAxMiwxMS42MTQyODU3IDEyLDExLjE0Mjg1NzEgTDEyLDAuODU3MTQyODU3IEMxMiwwLjM4NTcxNDI4NiAxMS42MTQyODU3LDAgMTEuMTQyODU3MSwwIEwxMS4xNDI4NTcxLDAgWiBNMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwxMS4xNDI4NTcxLDExLjE0Mjg1NzEgWiBNMy40Mjg1NzE0Myw2IEMzLjQyODU3MTQzLDQuNTc3MTQyODYgNC41NzcxNDI4NiwzLjQyODU3MTQzIDYsMy40Mjg1NzE0MyBDNy40MjI4NTcxNCwzLjQyODU3MTQzIDguNTcxNDI4NTcsNC41NzcxNDI4NiA4LjU3MTQyODU3LDYgQzguNTcxNDI4NTcsNy40MjI4NTcxNCA3LjQyMjg1NzE0LDguNTcxNDI4NTcgNiw4LjU3MTQyODU3IEM0LjU3NzE0Mjg2LDguNTcxNDI4NTcgMy40Mjg1NzE0Myw3LjQyMjg1NzE0IDMuNDI4NTcxNDMsNiBMMy40Mjg1NzE0Myw2IFoiLz48L3N2Zz4=');
                background-color: ${hyperStatusLine.dirtyColor};
            }
            .icon_push, .icon_pull {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjE0Mjg1NzE0LDYuODU3MTQyODYgTDIuNTcxNDI4NTcsNi44NTcxNDI4NiBMMi41NzE0Mjg1Nyw1LjE0Mjg1NzE0IEw1LjE0Mjg1NzE0LDUuMTQyODU3MTQgTDUuMTQyODU3MTQsMi41NzE0Mjg1NyBMOS40Mjg1NzE0Myw2IEw1LjE0Mjg1NzE0LDkuNDI4NTcxNDMgTDUuMTQyODU3MTQsNi44NTcxNDI4NiBMNS4xNDI4NTcxNCw2Ljg1NzE0Mjg2IFogTTEyLDAuODU3MTQyODU3IEwxMiwxMS4xNDI4NTcxIEMxMiwxMS42MTQyODU3IDExLjYxNDI4NTcsMTIgMTEuMTQyODU3MSwxMiBMMC44NTcxNDI4NTcsMTIgQzAuMzg1NzE0Mjg2LDEyIDAsMTEuNjE0Mjg1NyAwLDExLjE0Mjg1NzEgTDAsMC44NTcxNDI4NTcgQzAsMC4zODU3MTQyODYgMC4zODU3MTQyODYsMCAwLjg1NzE0Mjg1NywwIEwxMS4xNDI4NTcxLDAgQzExLjYxNDI4NTcsMCAxMiwwLjM4NTcxNDI4NiAxMiwwLjg1NzE0Mjg1NyBMMTIsMC44NTcxNDI4NTcgWiBNMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMC44NTcxNDI4NTcsMC44NTcxNDI4NTcgTDAuODU3MTQyODU3LDExLjE0Mjg1NzEgTDExLjE0Mjg1NzEsMTEuMTQyODU3MSBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBaIiB0cmFuc2Zvcm09Im1hdHJpeCgwIC0xIC0xIDAgMTIgMTIpIi8+PC9zdmc+');
                background-color: ${hyperStatusLine.arrowsColor};
            }
            .icon_pull {
                transform: scaleY(-1);
                -webkit-mask-position: 0 8px;
            }
        `
    })
};

let curPid;
let curCwd;
let curBranch;
let curRemote;
let repoDirty;
let pushArrow;
let pullArrow;
let gitUser;

// Current shell cwd
const setCwd = (pid) => {
    exec(`lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`, (err, cwd) => {
        curCwd = cwd.trim();
        setBranch(curCwd);
    })
};

// Current git branch
const setBranch = (actionCwd) => {
    exec(`git config --get user.email`, {cwd: actionCwd}, (error, email) => {
        gitUser = email.trim();
        console.log(gitUser);
    })
    exec(`git symbolic-ref --short HEAD || git rev-parse --short HEAD`, { cwd: actionCwd }, (err, branch) => {
        curBranch = branch;

        if (branch !== '') {
            setRemote(actionCwd);
            checkDirty(actionCwd);
            checkArrows(actionCwd);
        }
    })
};

// Current git remote
const setRemote = (actionCwd) => {
    exec(`git config --get remote.origin.url`, { cwd: actionCwd }, (err, remote) => {
        curRemote = remote.trim().replace(/^git@(.*?):/, 'https://$1/').replace(/[A-z0-9\-]+@/, '').replace(/\.git$/, '');
    })
};

// Check if repo is dirty
const checkDirty = (actionCwd) => {
    exec(`git status --porcelain --ignore-submodules -unormal`, { cwd: actionCwd }, (err, dirty) => {
        repoDirty = dirty;
    })
};

// Check git left & right arrows status
const checkArrows = (actionCwd) => {
    exec(`git rev-list --left-right --count HEAD...@'{u}' 2>/dev/null`, { cwd: actionCwd }, (err, arrows) => {
        arrows = arrows.split('\t');
        pushArrow = arrows[0] > 0 ? arrows[0] : '';
        pullArrow = arrows[1] > 0 ? arrows[1] : '';
    })
};

// Status line
exports.decorateHyper = (Hyper, { React }) => {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                folder: curCwd,
                branch: curBranch,
                remote: curRemote,
                dirty: repoDirty,
                push: pushArrow,
                pull: pullArrow,
                user: gitUser,
            }
            this.handleClick = this.handleClick.bind(this);
        }
        handleClick(e) {
            if (e.target.classList.contains('item_folder')) shell.openExternal('file://'+this.state.folder);
            else shell.openExternal(this.state.remote + "/tree/" + this.state.branch);
        }
        render() {
            const hasFolder = this.state.folder ? ' item_active item_click' : '';
            const hasBranch = this.state.branch ? ' item_active' : '';
            const hasRemote = this.state.remote ? ' item_click' : '';
            const isDirty = this.state.dirty ? ' icon_active' : '';
            const hasPush = this.state.push ? ' icon_active' : '';
            const hasPull = this.state.pull ? ' icon_active' : '';

            return (
                React.createElement(Hyper, Object.assign({}, this.props, {
                    customChildren: React.createElement('footer', { className: 'footer_footer' },
                        React.createElement('div', { title: this.state.folder, className: `item_item item_folder${hasFolder}`, onClick: this.handleClick }, this.state.folder ? tildify(String(this.state.folder)) : ''),
                        React.createElement('div', { title: "GitData", className: "item_gitdata"},
                            React.createElement('div', { title: gitUser, className: `item_item item_user${hasBranch}`, onClick: this.handleClick },
                                    React.createElement('span', { className: 'item_text' }, gitUser)
                            ),
                            React.createElement('div', { title: this.state.remote, className: `item_item item_branch${hasBranch}${hasRemote}`, onClick: this.handleClick },
                                React.createElement('span', { className: 'item_text' }, this.state.branch),
                                React.createElement('i', { title: 'git-dirty', className: `item_icon icon_dirty${isDirty}` }),
                                React.createElement('i', { title: 'git-push', className: `item_icon icon_push${hasPush}` }),
                                React.createElement('i', { title: 'git-pull', className: `item_icon icon_pull${hasPull}` })
                            )
                        )
                    )
                }))
            )
        }
        componentDidMount() {
            this.interval = setInterval(() => {
                this.setState({
                    folder: curCwd,
                    branch: curBranch,
                    remote: curRemote,
                    dirty: repoDirty,
                    push: pushArrow,
                    pull: pullArrow,
                })
            }, 100)
        }
        componentWillUnmount() {
            clearInterval(this.interval)
        }
    };
};

// Sessions
exports.middleware = (store) => (next) => (action) => {
    const uids = store.getState().sessions.sessions;

    switch (action.type) {
        case 'SESSION_SET_XTERM_TITLE':
            curPid = uids[action.uid].pid;
            break;
        case 'SESSION_ADD':
            curPid = action.pid;
            setCwd(curPid);
            break;
        case 'SESSION_ADD_DATA':
            const { data } = action;
            const enterKey = data.indexOf('\n') > 0;

            if (enterKey) setCwd(curPid);
            break;
        case 'SESSION_SET_ACTIVE':
            curPid = uids[action.uid].pid;
            setCwd(curPid);
            break;
    }
    next(action);
};
