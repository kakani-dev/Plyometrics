import { HomeIcon, ClipboardDocumentListIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
            id: 'dashboards.userScreen',
            path: path(ROOT_DASHBOARDS, '/user-screen'),
            type: NAV_TYPE_ITEM,
            title: 'User Screen',
            transKey: 'nav.dashboards.userScreen',
            Icon: UserIcon,
        },
        {
            id: 'dashboards.counselorScreen',
            path: path(ROOT_DASHBOARDS, '/counselor-screen'),
            type: NAV_TYPE_ITEM,
            title: 'Counselor Screen',
            transKey: 'nav.dashboards.counselorScreen',
            Icon: UserIcon,
        },
        {
            id: 'dashboards.candidateRegistration',
            path: path(ROOT_DASHBOARDS, '/candidate-registration'),
            type: NAV_TYPE_ITEM,
            title: 'Candidate Registration',
            transKey: 'nav.dashboards.candidateRegistration',
            Icon: DocumentTextIcon,
        },
        {
            id: 'dashboards.assessmentUi',
            path: path(ROOT_DASHBOARDS, '/assessment-ui'),
            type: NAV_TYPE_ITEM,
            title: 'Assessment UI',
            transKey: 'nav.dashboards.assessmentUi',
            Icon: ClipboardDocumentListIcon,
        },
        {
            id: 'dashboards.report',
            path: path(ROOT_DASHBOARDS, '/report'),
            type: NAV_TYPE_ITEM,
            title: 'Assessment Report',
            transKey: 'nav.dashboards.assessmentReport',
            Icon: ClipboardDocumentListIcon,
        },
    ]
}
