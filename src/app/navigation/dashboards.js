import { HomeIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_DASHBOARDS = '/dashboards'

const path = (root, item) => `${root}${item}`;

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: '/dashboards',
    title: 'Dashboards',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
    childs: [
        {
            id: 'dashboards.home',
            path: path(ROOT_DASHBOARDS, '/home'),
            type: NAV_TYPE_ITEM,
            title: 'Home',
            transKey: 'nav.dashboards.home',
            Icon: HomeIcon,
        },
        {
            id: 'dashboards.user-exam-report',
            path: path(ROOT_DASHBOARDS, '/user-exam-report'),
            type: NAV_TYPE_ITEM,
            title: 'User Exam Report',
            transKey: 'nav.dashboards.userExamReport',
            Icon: DocumentTextIcon,
        },
        {
            id: 'dashboards.user-response',
            path: path(ROOT_DASHBOARDS, '/user-response'),
            type: NAV_TYPE_ITEM,
            title: 'User Response',
            transKey: 'nav.dashboards.userResponse',
            Icon: ChatBubbleLeftRightIcon,
        },
        {
            id: 'dashboards.marks-report',
            path: path(ROOT_DASHBOARDS, '/marks-report'),
            type: NAV_TYPE_ITEM,
            title: 'Marks Report',
            transKey: 'nav.dashboards.marksReport',
            Icon: ChartBarSquareIcon,
        },
    ]
}
