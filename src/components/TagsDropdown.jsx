import React, { useState, useMemo } from 'react';
import './TagsDropdown.css';

export function formatTooltipPath(path, tag) {
  const actualPath = (path && Array.isArray(path) && path.length > 0)
    ? path
    : (tag && tag.path && Array.isArray(tag.path) && tag.path.length > 0)
      ? tag.path
      : null;

  // Do not show tooltip for first-level tags (e.g. 'Customers')
  if (actualPath && actualPath.length > 1) {
    return actualPath.join('/');
  }

  if (tag) {
    const found = SAMPLE_DROPDOWN_TAGS.find(
      (t) => t.id === tag.id || (t.name && tag.name && t.name.toLowerCase() === tag.name.toLowerCase())
    );
    if (found && found.path && found.path.length > 1) {
      return found.path.join('/');
    }
  }
  return null;
}

export function getThemeForColor(color) {
  if (!color) return 'blue';
  const c = color.toLowerCase();
  if (c.includes('1f93ff') || c.includes('20648f') || c.includes('3b82f6') || c.includes('0284c7')) return 'blue';
  if (c.includes('8b5cf6') || c.includes('ede9fe') || c.includes('3f4784') || c.includes('6d426e')) return 'lavender';
  if (c.includes('ec4899') || c.includes('e879f9') || c.includes('f43f5e') || c.includes('8e2526')) return 'pink';
  if (c.includes('fb923c') || c.includes('f97316') || c.includes('9d431c')) return 'orange';
  if (c.includes('fef08a') || c.includes('eab308') || c.includes('5b5417')) return 'yellow';
  if (c.includes('22c55e') || c.includes('16a34a') || c.includes('1a4c3f')) return 'green';
  return 'blue';
}

export function getTagTheme(tag) {
  if (!tag) return 'blue';
  if (tag.theme) return tag.theme;
  return getThemeForColor(tag.color);
}

export function getTagChipStyle(tag) {
  if (!tag) return {};
  const theme = tag.theme || getThemeForColor(tag.color);
  if (theme) {
    return {};
  }
  if (tag.color) {
    return {
      backgroundColor: `${tag.color}20`,
      borderColor: `${tag.color}50`,
      color: tag.color,
    };
  }
  return {};
}

const RAW_DROPDOWN_TAG_TREE = [
  {
    id: 'customers',
    name: 'Customers',
    hasChildren: true,
    theme: 'blue',
    color: '#1f93ff',
    children: [
      {
        id: 'na',
        name: 'North America',
        hasChildren: true,
        theme: 'blue',
        color: '#1f93ff',
        children: [
          { id: 'tier_1', name: 'Tier 1', theme: 'blue', color: '#1f93ff' },
          { id: 'tier_02', name: 'Tier 02', theme: 'orange', color: '#fb923c' },
          { id: 'tier_03', name: 'Tier 03', theme: 'lavender', color: '#8b5cf6' },
        ]
      },
      {
        id: 'emea',
        name: 'EMEA',
        hasChildren: true,
        theme: 'green',
        color: '#10b981',
        children: [
          { id: 'uk_ireland', name: 'UK & Ireland', theme: 'blue', color: '#1f93ff' },
          { id: 'dach', name: 'DACH Region', theme: 'green', color: '#10b981' },
        ]
      },
      {
        id: 'midmarket',
        name: 'Mid Market',
        hasChildren: true,
        theme: 'yellow',
        color: '#eab308',
        children: [
          { id: 'inbound_leads', name: 'Inbound Leads', theme: 'yellow', color: '#eab308' },
          { id: 'renewals_q4', name: 'Renewals Q4', theme: 'lavender', color: '#8b5cf6' },
        ]
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    hasChildren: true,
    theme: 'lavender',
    color: '#8b5cf6',
    children: [
      {
        id: 'logistics',
        name: 'Logistics',
        hasChildren: true,
        theme: 'lavender',
        color: '#8b5cf6',
        children: [
          { id: 'delivery_issues', name: 'Delivery Issues', theme: 'orange', color: '#fb923c' },
          { id: 'address_change', name: 'Address Change', theme: 'lavender', color: '#8b5cf6' },
        ]
      }
    ]
  },
  {
    id: 'technical_support',
    name: 'Technical Support',
    hasChildren: true,
    theme: 'pink',
    color: '#ec4899',
    children: [
      { id: 'bug_reports', name: 'Bug Reports', theme: 'pink', color: '#ec4899' },
      { id: 'feature_requests', name: 'Feature Requests', theme: 'green', color: '#10b981' },
    ]
  },
  // Familiar tags from user screenshot with hierarchy paths
  {
    id: 'a2',
    name: 'a2',
    theme: 'yellow',
    color: '#eab308',
    path: ['Internal QA', 'Channels Test', 'a2']
  },
  {
    id: 'aaa3',
    name: 'aaa3',
    theme: 'lavender',
    color: '#8b5cf6',
    path: ['Internal QA', 'Channels Test', 'aaa3']
  },
  {
    id: 'normal_01',
    name: 'Normal Tag 01',
    theme: 'blue',
    color: '#1f93ff',
  },
  {
    id: 'normal_02',
    name: 'Normal Tag 02',
    theme: 'pink',
    color: '#ec4899',
  },
  {
    id: 'inbox',
    name: 'Inbox',
    theme: 'blue',
    color: '#1f93ff',
    path: ['Inbox']
  },
  {
    id: 'ooo',
    name: 'Out of Office mails',
    theme: 'pink',
    color: '#e879f9',
    path: ['Out of Office mails']
  },
  {
    id: 'priority',
    name: 'Priority',
    theme: 'orange',
    color: '#fb923c',
    path: ['Priority']
  },
];

// Enrich tree nodes with full hierarchical path
function enrichTreeWithPaths(nodes, parentPath = [], inheritedTheme = 'blue', inheritedColor = '#1f93ff') {
  return nodes.map(node => {
    const curPath = node.path || [...parentPath, node.name];
    const theme = node.theme || inheritedTheme;
    const color = node.color || inheritedColor;
    const item = { ...node, path: curPath, theme, color };
    if (item.children) {
      item.children = enrichTreeWithPaths(item.children, curPath, theme, color);
    }
    return item;
  });
}

export const DROPDOWN_TAG_TREE = enrichTreeWithPaths(RAW_DROPDOWN_TAG_TREE);

export const SAMPLE_DROPDOWN_TAGS = [
  { id: 'tier_1', name: 'Tier 1', theme: 'blue', color: '#1f93ff', path: ['Customers', 'North America', 'Tier 1'] },
  { id: 'tier_02', name: 'Tier 02', theme: 'orange', color: '#fb923c', path: ['Customers', 'North America', 'Tier 02'] },
  { id: 'tier_03', name: 'Tier 03', theme: 'lavender', color: '#8b5cf6', path: ['Customers', 'North America', 'Tier 03'] },
  { id: 'uk_ireland', name: 'UK & Ireland', theme: 'blue', color: '#1f93ff', path: ['Customers', 'EMEA', 'UK & Ireland'] },
  { id: 'dach', name: 'DACH Region', theme: 'green', color: '#10b981', path: ['Customers', 'EMEA', 'DACH Region'] },
  { id: 'inbound_leads', name: 'Inbound Leads', theme: 'yellow', color: '#eab308', path: ['Customers', 'Mid Market', 'Inbound Leads'] },
  { id: 'renewals_q4', name: 'Renewals Q4', theme: 'lavender', color: '#8b5cf6', path: ['Customers', 'Mid Market', 'Renewals Q4'] },
  { id: 'delivery_issues', name: 'Delivery Issues', theme: 'orange', color: '#fb923c', path: ['Operations', 'Logistics', 'Delivery Issues'] },
  { id: 'address_change', name: 'Address Change', theme: 'lavender', color: '#8b5cf6', path: ['Operations', 'Logistics', 'Address Change'] },
  { id: 'bug_reports', name: 'Bug Reports', theme: 'pink', color: '#ec4899', path: ['Technical Support', 'Bug Reports'] },
  { id: 'feature_requests', name: 'Feature Requests', theme: 'green', color: '#10b981', path: ['Technical Support', 'Feature Requests'] },
  { id: 'a2', name: 'a2', theme: 'yellow', color: '#eab308', path: ['Internal QA', 'Channels Test', 'a2'] },
  { id: 'aaa3', name: 'aaa3', theme: 'lavender', color: '#8b5cf6', path: ['Internal QA', 'Channels Test', 'aaa3'] },
  { id: 'normal_01', name: 'Normal Tag 01', theme: 'blue', color: '#1f93ff', path: ['Normal Tag 01'] },
  { id: 'normal_02', name: 'Normal Tag 02', theme: 'pink', color: '#ec4899', path: ['Normal Tag 02'] },
  { id: 'na', name: 'North America', theme: 'blue', color: '#1f93ff', path: ['Customers', 'North America'] },
  { id: 'customers', name: 'Customers', theme: 'blue', color: '#1f93ff', path: ['Customers'] },
  { id: 'operations', name: 'Operations', theme: 'lavender', color: '#8b5cf6', path: ['Operations'] },
  { id: 'technical_support', name: 'Technical Support', theme: 'pink', color: '#ec4899', path: ['Technical Support'] },
  { id: 'inbox', name: 'Inbox', theme: 'blue', color: '#1f93ff', path: ['Inbox'] },
  { id: 'ooo', name: 'Out of Office mails', theme: 'pink', color: '#e879f9', path: ['Out of Office mails'] },
  { id: 'priority', name: 'Priority', theme: 'orange', color: '#fb923c', path: ['Priority'] },
];

export function getRandomTagsForId(id) {
  const seed = typeof id === 'number' ? id : (String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  // 1 to 3 tags per email
  const count = 1 + (seed % 3);
  const selected = [];
  for (let i = 0; i < count; i++) {
    const idx = (seed * 7 + i * 5) % SAMPLE_DROPDOWN_TAGS.length;
    const candidate = SAMPLE_DROPDOWN_TAGS[idx];
    if (!selected.some(t => t.id === candidate.id)) {
      selected.push(candidate);
    }
  }
  return selected;
}

// Flatten tree for quick global fuzzy search
function flattenTags(nodes) {
  let list = [];
  nodes.forEach(node => {
    list.push(node);
    if (node.children) {
      list = list.concat(flattenTags(node.children));
    }
  });
  return list;
}

const ALL_DROPDOWN_TAGS = flattenTags(DROPDOWN_TAG_TREE);

const TagsDropdown = ({ selectedTags = [], onApply, onCancel, style = {}, dropdownRef }) => {
  // Map of selected items: { [id]: tagObj }
  const [stagedMap, setStagedMap] = useState(() => {
    const map = {};
    selectedTags.forEach(t => { map[t.id] = t; });
    return map;
  });

  const [currentParent, setCurrentParent] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle selection for an item (does NOT drill down)
  const toggleSelect = (item) => {
    setStagedMap(prev => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = {
          id: item.id,
          name: item.name,
          theme: item.theme || 'lavender',
          path: item.path || [item.name]
        };
      }
      return next;
    });
  };

  // Drill down into folder (triggered strictly by right-chevron)
  const handleDrillInto = (folder, e) => {
    e.stopPropagation();
    setBreadcrumbs(prev => [...prev, folder]);
    setCurrentParent(folder);
  };

  // Drill back up one level
  const handleDrillBack = () => {
    if (breadcrumbs.length <= 1) {
      setBreadcrumbs([]);
      setCurrentParent(null);
    } else {
      const nextBreadcrumbs = breadcrumbs.slice(0, -1);
      setBreadcrumbs(nextBreadcrumbs);
      setCurrentParent(nextBreadcrumbs[nextBreadcrumbs.length - 1]);
    }
  };

  // Filtered displayed list
  const isSearching = searchQuery.trim().length > 0;
  const displayedItems = useMemo(() => {
    if (isSearching) {
      const q = searchQuery.toLowerCase().trim();
      return ALL_DROPDOWN_TAGS.filter(item =>
        item.name.toLowerCase().includes(q)
      );
    }
    return currentParent ? (currentParent.children || []) : DROPDOWN_TAG_TREE;
  }, [isSearching, searchQuery, currentParent]);

  // Back header label: '< Customers' or '< North America'
  const backLabel = useMemo(() => {
    if (!currentParent) return '';
    return currentParent.name;
  }, [currentParent]);

  const selectedCount = Object.keys(stagedMap).length;

  return (
    <div
      ref={dropdownRef}
      className="tags-dropdown-popover"
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Search Box (Figma: Search tags) */}
      <div className="tags-dd-search-wrap">
        <div className="tags-dd-search-box">
          <span className="tags-dd-search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="text"
            className="tags-dd-search-input"
            placeholder="Search tags"
            value={searchQuery}
            autoFocus
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Drilldown Back Navigation Row */}
      {!isSearching && currentParent && (
        <div className="tags-dd-back-row" onClick={handleDrillBack}>
          <span className="tags-dd-back-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </span>
          <span>{backLabel}</span>
        </div>
      )}

      {/* 3. List Items */}
      <div className="tags-dd-list">
        {isSearching && displayedItems.length === 0 && (
          <div style={{ padding: '16px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No tags found
          </div>
        )}

        {displayedItems.map((item) => {
          const isChecked = !!stagedMap[item.id];
          const hasChildren = !isSearching && item.hasChildren && item.children && item.children.length > 0;
          const hasSubtitle = isSearching && item.path && item.path.length > 1;
          const subtitlePath = hasSubtitle ? item.path.slice(0, -1).join(' / ') : null;

          return (
            <div
              key={item.id}
              className={`tags-dd-item ${hasSubtitle ? 'has-subtitle' : ''}`}
              onClick={() => toggleSelect(item)}
            >
              <div className="tags-dd-item-left">
                {/* Checkbox */}
                <div
                  className={`tags-dd-cb ${isChecked ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(item);
                  }}
                >
                  {isChecked && (
                    <span className="tags-dd-cb-check">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Label & Subtitle Stack */}
                <div className="tags-dd-text-col">
                  <span className="tags-dd-label" title={item.name}>
                    {item.name}
                  </span>
                  {hasSubtitle && (
                    <span className="tags-dd-subtitle" title={subtitlePath}>
                      {subtitlePath}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Chevron for Drilldown (Clicking this strictly triggers drilldown) */}
              {hasChildren && (
                <div
                  className="tags-dd-drill-btn"
                  title={`Open ${item.name}`}
                  onClick={(e) => handleDrillInto(item, e)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Footer: {N} selected    [ Cancel ] [ Apply ] */}
      <div className="tags-dd-footer">
        <span className="tags-dd-count-text">
          {selectedCount} selected
        </span>

        <div className="tags-dd-footer-actions">
          <button
            type="button"
            className="tags-dd-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="tags-dd-btn-apply"
            onClick={() => onApply(Object.values(stagedMap))}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsDropdown;
